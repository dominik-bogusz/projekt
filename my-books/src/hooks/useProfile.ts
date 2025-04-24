// src/hooks/useProfile.ts
import { useState, useCallback, useEffect } from 'react';
import { userClient } from '../api/client';
import { UserProfile } from '../types/profile';
import { useAuth } from '../context/AuthContext';
import useToast from './useToast';

interface UseProfileReturn {
	profile: UserProfile | null;
	isLoading: boolean;
	error: string | null;
	isEditing: boolean;
	setIsEditing: (value: boolean) => void;
	fetchProfile: (userId: string) => Promise<void>;
	updateProfile: (profileData: Partial<UserProfile>) => Promise<boolean>;
	isFollowing: boolean;
	followersCount: number;
	followingCount: number;
	toggleFollow: () => Promise<void>;
}

/**
 * Hook for managing user profiles
 */
const useProfile = (initialUserId?: string): UseProfileReturn => {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isFollowing, setIsFollowing] = useState(false);
	const [followersCount, setFollowersCount] = useState(0);
	const [followingCount, setFollowingCount] = useState(0);
	const { user } = useAuth();
	const toast = useToast();

	const fetchProfile = useCallback(
		async (userId: string) => {
			if (!userId) return;

			setIsLoading(true);
			setError(null);

			try {
				const fetchedProfile = await userClient.getProfile(userId);

				if (fetchedProfile) {
					setProfile(fetchedProfile);

					// Check if the current user is following this profile
					if (user && user.id !== userId) {
						const following = await userClient.isFollowing(user.id, userId);
						setIsFollowing(following);
					}

					// Get followers and following counts
					const { data: followers } = await supabase
						.from('followers')
						.select('id', { count: 'exact' })
						.eq('following_id', userId);

					const { data: following } = await supabase
						.from('followers')
						.select('id', { count: 'exact' })
						.eq('follower_id', userId);

					setFollowersCount(followers?.length || 0);
					setFollowingCount(following?.length || 0);
				} else if (user && user.id === userId) {
					// Create a new profile for the user if they don't have one
					const newProfile: Partial<UserProfile> = {
						id: user.id,
						user_id: user.id,
						display_name: user.email?.split('@')[0] || 'Użytkownik',
						email: user.email,
						is_public: true,
					};

					const createdProfile = await userClient.upsertProfile(newProfile);
					setProfile(createdProfile);
				} else {
					setError('Profil nie został znaleziony.');
				}
			} catch (err) {
				console.error('Error fetching profile:', err);
				setError('Nie udało się załadować profilu. Spróbuj ponownie później.');
			} finally {
				setIsLoading(false);
			}
		},
		[user]
	);

	const updateProfile = useCallback(
		async (profileData: Partial<UserProfile>): Promise<boolean> => {
			if (!user || !profile) return false;

			try {
				const updatedProfile = await userClient.upsertProfile({
					...profileData,
					id: profile.id,
					user_id: profile.user_id,
				});

				setProfile(updatedProfile);
				toast.success('Profil został zaktualizowany.');
				return true;
			} catch (err) {
				console.error('Error updating profile:', err);
				toast.error('Wystąpił błąd podczas aktualizacji profilu.');
				return false;
			}
		},
		[user, profile, toast]
	);

	const toggleFollow = useCallback(async () => {
		if (!user || !profile || user.id === profile.id) return;

		try {
			if (isFollowing) {
				await userClient.unfollowUser(user.id, profile.id);
				setFollowersCount((prev) => prev - 1);
			} else {
				await userClient.followUser(user.id, profile.id);
				setFollowersCount((prev) => prev + 1);
			}

			setIsFollowing(!isFollowing);
		} catch (err) {
			console.error('Error toggling follow status:', err);
			toast.error('Wystąpił błąd podczas zmiany statusu obserwowania.');
		}
	}, [user, profile, isFollowing, toast]);

	// Fetch profile on initial render if userId is provided
	useEffect(() => {
		if (initialUserId) {
			fetchProfile(initialUserId);
		}
	}, [initialUserId, fetchProfile]);

	return {
		profile,
		isLoading,
		error,
		isEditing,
		setIsEditing,
		fetchProfile,
		updateProfile,
		isFollowing,
		followersCount,
		followingCount,
		toggleFollow,
	};
};

export default useProfile;
