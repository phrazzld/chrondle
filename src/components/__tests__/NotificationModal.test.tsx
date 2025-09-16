import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { NotificationModal } from "@/components/modals/NotificationModal";

const createNotificationsMock = () => {
  const callOrder: string[] = [];

  const requestPermission = vi.fn(async () => {
    callOrder.push("request");
    return "granted" as NotificationPermission;
  });

  const toggleReminders = vi.fn(async () => {
    callOrder.push("toggle");
    return true;
  });

  return {
    callOrder,
    notifications: {
      settings: {
        enabled: false,
        permission: "default" as NotificationPermission,
        time: "09:00",
      },
      isSupported: true,
      isEnabled: false,
      reminderTime: "09:00",
      permissionStatus: "default" as NotificationPermission,
      isLoading: false,
      toggleReminders,
      updateTime: vi.fn(async () => true),
      requestPermission,
      shouldShowPermissionPrompt: false,
      availableTimes: [],
      formatTime: (value: string) => value,
    },
  };
};

let notificationsStub = createNotificationsMock();

vi.mock("@/components/SessionThemeProvider", () => ({
  useTheme: () => ({ notifications: notificationsStub.notifications }),
}));

vi.mock("@/components/ui/TimePicker", () => ({
  TimePicker: ({ value }: { value: string }) => (
    <div data-testid="time-picker">Time: {value}</div>
  ),
}));

describe("NotificationModal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    notificationsStub = createNotificationsMock();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const openExplanationFlow = () => {
    render(<NotificationModal isOpen={true} onClose={vi.fn()} />);

    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);

    const enableButton = screen.getByRole("button", {
      name: "Enable Notifications",
    });
    fireEvent.click(enableButton);
  };

  it("enables reminders after permission is granted and resets view", async () => {
    openExplanationFlow();

    const requestButton = screen.getByRole("button", {
      name: "Request Permission",
    });

    await act(async () => {
      fireEvent.click(requestButton);
    });

    await waitFor(
      () => {
        expect(
          notificationsStub.notifications.toggleReminders,
        ).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 },
    );

    expect(screen.getByText("Notifications Enabled!")).toBeInTheDocument();
    expect(notificationsStub.callOrder).toEqual(["request", "toggle"]);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await waitFor(
      () => {
        expect(screen.getByText("Notifications")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  }, 15000);

  it("clears completion timeout on unmount", async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    const { unmount } = render(
      <NotificationModal isOpen={true} onClose={vi.fn()} />,
    );

    const toggle = screen.getByRole("switch");
    await act(async () => {
      fireEvent.click(toggle);
    });

    const enableButton = screen.getByRole("button", {
      name: "Enable Notifications",
    });
    await act(async () => {
      fireEvent.click(enableButton);
    });

    const requestButton = screen.getByRole("button", {
      name: "Request Permission",
    });
    await act(async () => {
      fireEvent.click(requestButton);
    });

    await waitFor(
      () => {
        expect(
          notificationsStub.notifications.toggleReminders,
        ).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 },
    );

    expect(screen.getByText("Notifications Enabled!")).toBeInTheDocument();

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();

    act(() => {
      vi.runAllTimers();
    });

    clearTimeoutSpy.mockRestore();
  }, 15000);
});
