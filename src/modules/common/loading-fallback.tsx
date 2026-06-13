import { Loading } from "~/ui/loading/loading";

export const LoadingFallback = () => {
  return (
    <div class="flex w-full justify-center pt-10">
      <Loading size="xl" />
    </div>
  );
};
