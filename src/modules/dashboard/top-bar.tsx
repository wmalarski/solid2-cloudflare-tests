import { type Component } from "solid-js";
import { CurrentlyPlayingSection } from "./currently-playing-section";
import { SignOutButton } from "../auth/sign-out-button";

export const TopBar: Component = () => {
  return (
    <header class="flex w-full">
      <CurrentlyPlayingSection />
      <SignOutButton />
    </header>
  );
};
