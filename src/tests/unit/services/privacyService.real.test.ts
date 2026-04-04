import { apiRequest } from '@/hooks/useAPI';
import { RealPrivacyService } from '@/services/api/privacyService';
import { API_CONTRACTS } from '@/types/apiContracts';

jest.mock('@/hooks/useAPI', () => ({
  apiRequest: jest.fn(),
}));

const mockedApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('RealPrivacyService', () => {
  let service: RealPrivacyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RealPrivacyService();
  });

  it('fetches privacy settings using USERS_ME_PRIVACY contract', async () => {
    mockedApiRequest.mockResolvedValue({
      isPrivate: true,
      showHistory: false,
    });

    const settings = await service.getPrivacySettings();

    expect(settings).toEqual({ isPrivate: true, showHistory: false });
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_ME_PRIVACY
    );
  });

  it('updates privacy settings using USERS_ME_PRIVACY_UPDATE contract', async () => {
    mockedApiRequest.mockResolvedValue({
      isPrivate: false,
      showHistory: true,
    });

    const updated = await service.updatePrivacySettings({
      isPrivate: false,
      showHistory: true,
    });

    expect(updated).toEqual({ isPrivate: false, showHistory: true });
    expect(mockedApiRequest).toHaveBeenCalledWith(
      API_CONTRACTS.USERS_ME_PRIVACY_UPDATE,
      { payload: { isPrivate: false, showHistory: true } }
    );
  });
});
