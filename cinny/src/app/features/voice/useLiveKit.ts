import { useState, useCallback, useEffect, useRef } from "react";
import {
  Room,
  RoomEvent,
  RoomOptions,
} from "livekit-client";

const LIVEKIT_URL = "wss://livekit.endershare.org";
const TOKEN_SERVER_URL = "https://token.endershare.org";
const TURN_SECRET = "TurnSecret#Matrix2026!Secure";

export interface VoiceParticipant {
  identity: string;
  name: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isLocal: boolean;
}

interface UseLiveKitReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  participants: VoiceParticipant[];
  currentRoom: string | null;
  isMuted: boolean;
  connect: (roomName: string, matrixClient: any) => Promise<void>;
  disconnect: () => void;
  toggleMute: () => void;
}

// Pure JS SHA1 implementation
function sha1(message: Uint8Array): Uint8Array {
  const rotl = (n: number, s: number) => (n << s) | (n >>> (32 - s));
  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
  const ml = message.length * 8;
  const paddedLength = Math.ceil((message.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(message);
  padded[message.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, ml, false);
  for (let i = 0; i < paddedLength; i += 64) {
    const w = new Uint32Array(80);
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(i + j * 4, false);
    for (let j = 16; j < 80; j++) w[j] = rotl(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      let f: number, k: number;
      if (j < 20) { f = (b & c) | ((~b) & d); k = 0x5A827999; }
      else if (j < 40) { f = b ^ c ^ d; k = 0x6ED9EBA1; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8F1BBCDC; }
      else { f = b ^ c ^ d; k = 0xCA62C1D6; }
      const temp = (rotl(a, 5) + f + e + k + w[j]) >>> 0;
      e = d; d = c; c = rotl(b, 30); b = a; a = temp;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  const result = new Uint8Array(20);
  const resultView = new DataView(result.buffer);
  resultView.setUint32(0, h0, false); resultView.setUint32(4, h1, false);
  resultView.setUint32(8, h2, false); resultView.setUint32(12, h3, false);
  resultView.setUint32(16, h4, false);
  return result;
}

function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  if (key.length > blockSize) key = sha1(key);
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(key);
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) { ipad[i] = paddedKey[i] ^ 0x36; opad[i] = paddedKey[i] ^ 0x5c; }
  const innerData = new Uint8Array(blockSize + message.length);
  innerData.set(ipad); innerData.set(message, blockSize);
  const innerHash = sha1(innerData);
  const outerData = new Uint8Array(blockSize + 20);
  outerData.set(opad); outerData.set(innerHash, blockSize);
  return sha1(outerData);
}

function generateTurnCredentials(): { username: string; credential: string } {
  const expiry = Math.floor(Date.now() / 1000) + 86400;
  const username = `${expiry}:livekit`;
  const encoder = new TextEncoder();
  const signature = hmacSha1(encoder.encode(TURN_SECRET), encoder.encode(username));
  return { username, credential: btoa(String.fromCharCode(...signature)) };
}

export function useLiveKit(): UseLiveKitReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const roomRef = useRef<Room | null>(null);

  const updateParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    const allParticipants: VoiceParticipant[] = [];
    const local = room.localParticipant;
    allParticipants.push({
      identity: local.identity,
      name: local.name || local.identity.split(":")[0].slice(1),
      isSpeaking: local.isSpeaking,
      isMuted: !local.isMicrophoneEnabled,
      isLocal: true,
    });
    room.remoteParticipants.forEach((participant) => {
      allParticipants.push({
        identity: participant.identity,
        name: participant.name || participant.identity.split(":")[0].slice(1),
        isSpeaking: participant.isSpeaking,
        isMuted: !participant.isMicrophoneEnabled,
        isLocal: false,
      });
    });
    setParticipants(allParticipants);
  }, []);

  const connect = useCallback(async (roomName: string, matrixClient: any) => {
    // Disconnect from current room if switching
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    
    setIsConnecting(true);
    setError(null);

    try {
      const userId = matrixClient.getUserId() || "";
      const user = matrixClient.getUser(userId);
      const displayName = user?.displayName || userId.split(":")[0].slice(1);

      const tokenUrl = `${TOKEN_SERVER_URL}/token?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(displayName)}`;
      console.log("Fetching token from:", tokenUrl);
      const response = await fetch(tokenUrl);

      if (!response.ok) throw new Error("Token server error: " + response.status);

      const data = await response.json();
      const token = data.token;
      console.log("Got token for room:", data.room, "user:", data.username);

      const turnCreds = generateTurnCredentials();

      const roomOptions: RoomOptions = {
        adaptiveStream: true,
        dynacast: true,
        rtcConfig: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            {
              urls: ["turn:100.89.14.34:3478?transport=udp", "turn:100.89.14.34:3478?transport=tcp"],
              username: turnCreds.username,
              credential: turnCreds.credential,
            },
          ],
        },
      };

      const room = new Room(roomOptions);
      roomRef.current = room;

      room.on(RoomEvent.ParticipantConnected, updateParticipants);
      room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
      room.on(RoomEvent.TrackMuted, updateParticipants);
      room.on(RoomEvent.TrackUnmuted, updateParticipants);
      room.on(RoomEvent.ActiveSpeakersChanged, updateParticipants);
      room.on(RoomEvent.Disconnected, () => {
        console.log("LiveKit disconnected");
        setIsConnected(false);
        setCurrentRoom(null);
        setParticipants([]);
      });

      console.log("Connecting to LiveKit...");
      await room.connect(LIVEKIT_URL, token);
      console.log("Connected, enabling mic...");
      await room.localParticipant.setMicrophoneEnabled(true);

      setIsConnected(true);
      setCurrentRoom(roomName);
      updateParticipants();
    } catch (err) {
      console.error("LiveKit error:", err);
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  }, [updateParticipants]);

  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsConnected(false);
    setCurrentRoom(null);
    setParticipants([]);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const newMuted = !isMuted;
    await room.localParticipant.setMicrophoneEnabled(!newMuted);
    setIsMuted(newMuted);
    updateParticipants();
  }, [isMuted, updateParticipants]);

  useEffect(() => {
    return () => { if (roomRef.current) roomRef.current.disconnect(); };
  }, []);

  return { isConnected, isConnecting, error, participants, currentRoom, isMuted, connect, disconnect, toggleMute };
}
