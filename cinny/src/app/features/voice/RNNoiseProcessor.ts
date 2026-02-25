import type { AudioProcessorOptions, ProcessorWrapper } from "livekit-client";

const RNNOISE_SAMPLE_LENGTH = 480; // 10ms @ 48kHz

export class RNNoiseProcessor implements ProcessorWrapper<AudioProcessorOptions> {
  private context?: AudioContext;
  private worklet?: AudioWorkletNode;
  private source?: MediaStreamAudioSourceNode;
  private destination?: MediaStreamAudioDestinationNode;
  private enabled: boolean = false;
  name = "rnnoise-processor";

  async init(context: AudioContext, track: MediaStreamTrack): Promise<void> {
    this.context = context;
    
    try {
      // Load RNNoise WASM module
      const RNNoise = await import("@jitsi/rnnoise-wasm");
      
      // Add AudioWorklet processor
      const processorCode = `
        let rnnoiseModule;
        let rnnoiseState;
        let initialized = false;

        class RNNoiseWorkletProcessor extends AudioWorkletProcessor {
          constructor() {
            super();
            this.port.onmessage = this.handleMessage.bind(this);
          }

          handleMessage(event) {
            if (event.data.type === "init" && event.data.module) {
              rnnoiseModule = event.data.module;
              rnnoiseState = rnnoiseModule._rnnoise_create(null);
              initialized = true;
            }
          }

          process(inputs, outputs) {
            if (!initialized || !inputs[0] || !inputs[0][0]) {
              return true;
            }

            const input = inputs[0][0];
            const output = outputs[0][0];

            // Process in 480-sample chunks (10ms @ 48kHz)
            const chunkSize = ${RNNOISE_SAMPLE_LENGTH};
            for (let i = 0; i < input.length; i += chunkSize) {
              const chunk = input.slice(i, i + chunkSize);
              
              if (chunk.length === chunkSize) {
                // Convert float32 to int16 for RNNoise
                const pcm = new Int16Array(chunkSize);
                for (let j = 0; j < chunkSize; j++) {
                  pcm[j] = Math.max(-32768, Math.min(32767, chunk[j] * 32768));
                }

                // Process with RNNoise
                const ptr = rnnoiseModule._malloc(chunkSize * 2);
                rnnoiseModule.HEAP16.set(pcm, ptr / 2);
                rnnoiseModule._rnnoise_process_frame(rnnoiseState, ptr, ptr);
                const processed = rnnoiseModule.HEAP16.slice(ptr / 2, ptr / 2 + chunkSize);
                rnnoiseModule._free(ptr);

                // Convert back to float32
                for (let j = 0; j < chunkSize; j++) {
                  output[i + j] = processed[j] / 32768;
                }
              } else {
                // Copy remaining samples without processing
                for (let j = 0; j < chunk.length; j++) {
                  output[i + j] = chunk[j];
                }
              }
            }

            return true;
          }
        }

        registerProcessor("rnnoise-worklet-processor", RNNoiseWorkletProcessor);
      `;

      const blob = new Blob([processorCode], { type: "application/javascript" });
      const workletUrl = URL.createObjectURL(blob);
      
      await context.audioWorklet.addModule(workletUrl);
      URL.revokeObjectURL(workletUrl);

      // Create worklet node
      this.worklet = new AudioWorkletNode(context, "rnnoise-worklet-processor");
      
      // Initialize RNNoise WASM in worklet
      const rnnoiseWasm = await RNNoise.default();
      this.worklet.port.postMessage({ type: "init", module: rnnoiseWasm });

      // Setup audio graph
      const inputStream = new MediaStream([track]);
      this.source = context.createMediaStreamSource(inputStream);
      this.destination = context.createMediaStreamDestination();

      if (this.enabled) {
        this.source.connect(this.worklet);
        this.worklet.connect(this.destination);
      } else {
        this.source.connect(this.destination);
      }
      
      console.log("[RNNoise] Processor initialized");
    } catch (err) {
      console.error("[RNNoise] Init error:", err);
      throw err;
    }
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled;

    if (!this.source || !this.worklet || !this.destination) {
      return;
    }

    try {
      // Disconnect current routing
      this.source.disconnect();
      this.worklet.disconnect();

      // Reconnect based on enabled state
      if (enabled) {
        this.source.connect(this.worklet);
        this.worklet.connect(this.destination);
        console.log("[RNNoise] Enabled");
      } else {
        this.source.connect(this.destination);
        console.log("[RNNoise] Disabled");
      }
    } catch (err) {
      console.error("[RNNoise] Error toggling:", err);
      throw err;
    }
  }

  async destroy(): Promise<void> {
    if (this.worklet) {
      this.worklet.disconnect();
      this.worklet = undefined;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = undefined;
    }
    this.destination = undefined;
    this.context = undefined;
    console.log("[RNNoise] Destroyed");
  }

  async processTrack(track: MediaStreamTrack): Promise<MediaStreamTrack | undefined> {
    if (!this.context) {
      this.context = new AudioContext({ sampleRate: 48000 });
    }

    await this.init(this.context, track);
    
    if (this.destination) {
      return this.destination.stream.getAudioTracks()[0];
    }
    
    return undefined;
  }
}
