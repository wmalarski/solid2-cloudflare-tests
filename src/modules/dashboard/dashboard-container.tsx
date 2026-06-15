import type { Component } from "solid-js";
import { TopBar } from "./top-bar";
import { TasksBoard } from "./tasks-board";
import { TasksContextProvider } from "./data-contexts/tasks-context";
import { CurrentlyPlayingContextProvider } from "./data-contexts/currently-playing-context";

export const DashboardContainer: Component = () => {
  return (
    <TasksContextProvider>
      <CurrentlyPlayingContextProvider>
        <TopBar />
        <TasksBoard />
      </CurrentlyPlayingContextProvider>
    </TasksContextProvider>
  );
};
