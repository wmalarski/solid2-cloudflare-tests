import type { Component } from "solid-js";
import { TasksBoard } from "./tasks-board";
import { TasksContextProvider } from "./data-contexts/tasks-context";
import { CurrentlyPlayingContextProvider } from "./data-contexts/currently-playing-context";
import { CurrentlyPlayingSection } from "./currently-playing-section";
import { SignOutButton } from "../auth/sign-out-button";

export const DashboardContainer: Component = () => {
  return (
    <TasksContextProvider>
      <CurrentlyPlayingContextProvider>
        <main class="grid h-screen grid-rows-[auto_1fr_auto]">
          <header class="p-1">
            <div class="flex w-full bg-base-300">
              <SignOutButton />
            </div>
          </header>
          <TasksBoard />
          <footer class="p-1">
            <CurrentlyPlayingSection />
          </footer>
        </main>
      </CurrentlyPlayingContextProvider>
    </TasksContextProvider>
  );
};
