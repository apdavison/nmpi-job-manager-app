// vitest-fetch-mock installs `fetchMock` as a global (see setup.ts). Its upstream
// types make inspecting `mock.calls` awkward under strict mode, so we declare a
// pragmatic shape here for use in tests.
declare global {
  // eslint-disable-next-line no-var
  var fetchMock: {
    mock: { calls: any[] };
    mockResponse: (...args: any[]) => void;
    mockResponseOnce: (...args: any[]) => void;
    mockResponses: (...args: any[]) => void;
    mockReject: (...args: any[]) => void;
    resetMocks: () => void;
    [key: string]: any;
  };
}

export {};
