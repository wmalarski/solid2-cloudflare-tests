import type { Component } from "solid-js";
import { TopBar } from "./top-bar";
import { TasksBoard } from "./tasks-board";
import { TasksContextProvider } from "./tasks-context";

export const DashboardContainer: Component = () => {
  return (
    <TasksContextProvider>
      <TopBar />
      <TasksBoard />
    </TasksContextProvider>
  );
};
