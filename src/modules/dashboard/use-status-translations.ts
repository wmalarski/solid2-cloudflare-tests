import { useI18n } from "~/integrations/i18n";
import { STATUS_IN_PROGRESS, STATUS_NEW, STATUS_REVIEWED } from "./constansts";
import type { TaskStatus } from "./validation";

export const useStatusTranslations = () => {
  const { t } = useI18n();

  return (status: TaskStatus) => {
    switch (status) {
      case STATUS_NEW:
        return t("task.statuses.new");
      case STATUS_IN_PROGRESS:
        return t("task.statuses.inProgress");
      case STATUS_REVIEWED:
        return t("task.statuses.reviewed");
    }
  };
};
