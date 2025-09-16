import React from "react";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";

vi.mock("@/lib/serviceWorker", () => ({
  registerServiceWorker: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { registerServiceWorker } from "@/lib/serviceWorker";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const mockedRegister = vi.mocked(registerServiceWorker);

const originalEnv = process.env.NODE_ENV;
const originalReadyStateDescriptor = Object.getOwnPropertyDescriptor(
  document,
  "readyState",
);
const originalServiceWorkerDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  "serviceWorker",
);

function setReadyState(value: DocumentReadyState) {
  Object.defineProperty(document, "readyState", {
    configurable: true,
    get: () => value,
  });
}

beforeAll(() => {
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {},
  });
});

afterAll(() => {
  if (originalServiceWorkerDescriptor) {
    Object.defineProperty(
      navigator,
      "serviceWorker",
      originalServiceWorkerDescriptor,
    );
  } else {
    // @ts-expect-error - cleanup helper for test environment
    delete navigator.serviceWorker;
  }

  if (originalReadyStateDescriptor) {
    Object.defineProperty(document, "readyState", originalReadyStateDescriptor);
  }
});

beforeEach(() => {
  vi.clearAllMocks();
  mockedRegister.mockResolvedValue({ success: true });
  setReadyState("complete");
  vi.stubEnv("NODE_ENV", originalEnv || "test");
  vi.stubEnv("NEXT_PUBLIC_ENABLE_SERVICE_WORKER", "");
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("ServiceWorkerRegistration", () => {
  it("skips registration when disabled", async () => {
    vi.stubEnv("NODE_ENV", "development");

    render(<ServiceWorkerRegistration />);

    await waitFor(() => expect(mockedRegister).not.toHaveBeenCalled());
  });

  it("registers immediately when document already loaded", async () => {
    vi.stubEnv("NODE_ENV", "production");

    render(<ServiceWorkerRegistration />);

    await waitFor(() => expect(mockedRegister).toHaveBeenCalledTimes(1));
  });

  it("registers after load event when page is still loading", async () => {
    vi.stubEnv("NODE_ENV", "production");
    setReadyState("loading");

    render(<ServiceWorkerRegistration />);

    expect(mockedRegister).not.toHaveBeenCalled();

    setReadyState("complete");
    window.dispatchEvent(new Event("load"));

    await waitFor(() => expect(mockedRegister).toHaveBeenCalledTimes(1));
  });

  it("registers in development when override flag is set", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_SERVICE_WORKER", "true");

    render(<ServiceWorkerRegistration />);

    await waitFor(() => expect(mockedRegister).toHaveBeenCalledTimes(1));
  });
});
