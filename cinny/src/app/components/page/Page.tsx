import React, { ComponentProps, MutableRefObject, ReactNode, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { VoicePanel, VoiceRoom, useLiveKitContext } from "../../features/voice";
import { Box, Header, Line, Scroll, Text, as } from "folds";
import classNames from "classnames";
import { ContainerColor } from "../../styles/ContainerColor.css";
import * as css from "./style.css";
import { ScreenSize, useScreenSizeContext } from "../../hooks/useScreenSize";
import { useRoomSettingsState } from "../../state/hooks/roomSettings";
import { useSpaceSettingsState } from "../../state/hooks/spaceSettings";

type PageRootProps = {
  nav: ReactNode;
  children: ReactNode;
};

export function PageRoot({ nav, children }: PageRootProps) {
  const screenSize = useScreenSizeContext();
  const location = useLocation();
  const { showVoiceView, setShowVoiceView, isConnected } = useLiveKitContext();
  const prevPathRef = useRef(location.pathname);

  // Check if any settings panel is open
  const roomSettingsState = useRoomSettingsState();
  const spaceSettingsState = useSpaceSettingsState();
  const isSettingsOpen = !!roomSettingsState || !!spaceSettingsState;

  // Auto-hide voice view when navigating to ANY different page
  useEffect(() => {
    if (prevPathRef.current !== location.pathname && showVoiceView) {
      setShowVoiceView(false);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname, showVoiceView, setShowVoiceView]);

  // Hide voice view when settings panels open
  useEffect(() => {
    if (isSettingsOpen && showVoiceView) {
      setShowVoiceView(false);
    }
  }, [isSettingsOpen, showVoiceView, setShowVoiceView]);

  return (
    <Box grow="Yes" className={ContainerColor({ variant: "Background" })}>
      {nav}
      {screenSize !== ScreenSize.Mobile && (
        <Line variant="Background" size="300" direction="Vertical" />
      )}
      {showVoiceView && isConnected ? <VoiceRoom /> : children}
    </Box>
  );
}

type ClientDrawerLayoutProps = {
  children: ReactNode;
};
export function PageNav({
  size,
  children,
}: ClientDrawerLayoutProps & css.PageNavVariants) {
  const screenSize = useScreenSizeContext();
  const isMobile = screenSize === ScreenSize.Mobile;

  return (
    <Box
      grow={isMobile ? "Yes" : undefined}
      className={css.PageNav({ size })}
      shrink={isMobile ? "Yes" : "No"}
      direction="Column"
    >
      <Box grow="Yes" direction="Column" style={{ minHeight: 0, overflow: "hidden" }}>
        {children}
      </Box>
      <VoicePanel />
    </Box>
  );
}

export const PageNavHeader = as<"header", css.PageNavHeaderVariants>(
  ({ className, outlined, ...props }, ref) => (
    <Header
      className={classNames(css.PageNavHeader({ outlined }), className)}
      variant="Background"
      size="600"
      {...props}
      ref={ref}
    />
  )
);

export function PageNavContent({
  scrollRef,
  children,
}: {
  children: ReactNode;
  scrollRef?: MutableRefObject<HTMLDivElement | null>;
}) {
  return (
    <Box grow="Yes" direction="Column">
      <Scroll
        ref={scrollRef}
        variant="Background"
        direction="Vertical"
        size="300"
        hideTrack
        visibility="Hover"
      >
        <div className={css.PageNavContent}>{children}</div>
      </Scroll>
    </Box>
  );
}

export const Page = as<"div">(({ className, ...props }, ref) => (
  <Box
    grow="Yes"
    direction="Column"
    className={classNames(ContainerColor({ variant: "Surface" }), className)}
    {...props}
    ref={ref}
  />
));

export const PageHeader = as<"div", css.PageHeaderVariants>(
  ({ className, outlined, balance, ...props }, ref) => (
    <Header
      as="header"
      size="600"
      className={classNames(css.PageHeader({ balance, outlined }), className)}
      {...props}
      ref={ref}
    />
  )
);

export const PageContent = as<"div">(({ className, ...props }, ref) => (
  <div className={classNames(css.PageContent, className)} {...props} ref={ref} />
));

export function PageHeroEmpty({ children }: { children: ReactNode }) {
  return (
    <Box
      className={classNames(
        ContainerColor({ variant: "SurfaceVariant" }),
        css.PageHeroEmpty
      )}
      direction="Column"
      alignItems="Center"
      justifyContent="Center"
      gap="200"
    >
      {children}
    </Box>
  );
}

export const PageHeroSection = as<"div", ComponentProps<typeof Box>>(
  ({ className, ...props }, ref) => (
    <Box
      direction="Column"
      className={classNames(css.PageHeroSection, className)}
      {...props}
      ref={ref}
    />
  )
);

export function PageHero({
  icon,
  title,
  subTitle,
  children,
}: {
  icon: ReactNode;
  title: ReactNode;
  subTitle: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Box direction="Column" gap="400">
      <Box direction="Column" alignItems="Center" gap="200">
        {icon}
      </Box>
      <Box as="h2" direction="Column" gap="200" alignItems="Center">
        <Text align="Center" size="H2">
          {title}
        </Text>
        <Text align="Center" priority="400">
          {subTitle}
        </Text>
      </Box>
      {children}
    </Box>
  );
}

export const PageContentCenter = as<"div">(({ className, ...props }, ref) => (
  <div
    className={classNames(css.PageContentCenter, className)}
    {...props}
    ref={ref}
  />
));
