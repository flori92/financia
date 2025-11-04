import { SetMetadata } from '@nestjs/common';
import { UserProfile } from '../guards/user-profiles';

export const PROFILE_KEY = 'profile';
export const Profiles = (...profiles: UserProfile[]) => SetMetadata(PROFILE_KEY, profiles);
