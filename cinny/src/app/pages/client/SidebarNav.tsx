import React, { useRef } from 'react';
import { Scroll } from 'folds';

import {
  Sidebar,
  SidebarContent,
  SidebarStackSeparator,
  SidebarStack,
} from '../../components/sidebar';
import {
  DirectTab,
  HomeTab,
  SpaceTabs,
  InboxTab,
  ExploreTab,
  UnverifiedTab,
  SearchTab,
  UpdateTab,
} from './sidebar';
import { CreateTab } from './sidebar/CreateTab';

export function SidebarNav() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Sidebar>
      <SidebarContent
        scrollable={
          <Scroll ref={scrollRef} variant="Background" size="0">
            <SidebarStack>
              <UpdateTab />
              <SearchTab />
              <InboxTab />
            </SidebarStack>
            <SidebarStackSeparator />
            <SidebarStack>
              <HomeTab />
              <DirectTab />
            </SidebarStack>
            <SpaceTabs scrollRef={scrollRef} />
            <SidebarStackSeparator />
            <SidebarStack>
              <ExploreTab />
              <CreateTab />
            </SidebarStack>
          </Scroll>
        }
        sticky={
          <SidebarStack>
            <UnverifiedTab />
          </SidebarStack>
        }
      />
    </Sidebar>
  );
}
