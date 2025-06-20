export const mockIntersectionObserver = () => {
    // IntersectionObserver isn't available in test environment
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    });
    window.IntersectionObserver = mockIntersectionObserver;
  };

export const mockFetch = (returnValue = {}, responseCode = 200) => {
    return jest.spyOn(global, "fetch")
      .mockImplementation(() => Promise.resolve({
        ok: responseCode === 200,
        status: responseCode,
        json: async () => returnValue,
        text: async () => JSON.stringify(returnValue),
        statusText: _getStatusText(responseCode),
      } as Response));
  };

function _getStatusText(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return 'OK';
      case 500:
        return 'Internal Server Error';
      default: return 'Status Code not maintained'
    }
}
