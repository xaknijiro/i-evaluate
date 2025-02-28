import { usePage } from '@inertiajs/react';
import { Avatar, Box, Button, Stack, styled } from '@mui/material';
import axios from 'axios';
import * as React from 'react';

export default function UserPhoto({ userId, height, width }) {
    const { auth } = usePage().props;
    const { token } = auth;

    const [isLoading, setIsLoading] = React.useState(true);
    const [currentProfilePhoto, setCurrentProfilePhoto] = React.useState();

    const fetchProfilePhoto = async () => {
        const response = await axios.get(`/api/users/${userId}/profile-photo`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        setIsLoading(false);
        setCurrentProfilePhoto(response.data);
    }

    React.useEffect(() => {
        fetchProfilePhoto();
    }, []);

    return <>
        {!isLoading && <Avatar
            src={currentProfilePhoto}
            sx={{ m: 1, bgcolor: 'secondary.main', height, width }}
        />}
    </>;
}