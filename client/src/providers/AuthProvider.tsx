import { useEffect, type ReactNode } from 'react';

import { refreshToken, getMe } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

type Props = {
    children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
    const { setUser, setAccessToken, setLoading } = useAuth();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const tokenResponse = await refreshToken();
                setAccessToken(tokenResponse.data.accessToken);

                const meResponse = await getMe();
                setUser(meResponse.data);
            } catch {
                setUser(null);
                setAccessToken(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [setUser, setAccessToken, setLoading]);

    return <>{children}</>;
};
