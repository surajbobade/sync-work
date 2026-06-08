import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMe, login } from '../../api/auth';

export default function Login() {
    const { setUser, setAccessToken } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const res = await login({
            email,
            password,
        });

        setAccessToken(res.data.accessToken);

        const me = await getMe();

        setUser(me.data);

        navigate('/');
    };

    return (
        <div>
            <h1>Login</h1>

            <input
                placeholder="email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
