import { usePage } from '@inertiajs/react';
import { CloudUpload, PhotoCamera } from '@mui/icons-material';
import { Avatar, Box, Button, Stack, styled } from '@mui/material';
import axios from 'axios';
import * as React from 'react';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

export default function ProfilePhoto() {
    const { auth } = usePage().props;
    const { id, name, token } = auth;

    const [isLoading, setIsLoading] = React.useState(true);
    const [currentProfilePhoto, setCurrentProfilePhoto] = React.useState();
    const [filename, setFilename] = React.useState();
    const [preview, setPreview] = React.useState();

    const fetchProfilePhoto = async () => {
        const response = await axios.get(`/api/users/${id}/profile-photo`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        setIsLoading(false);
        setCurrentProfilePhoto(response.data);
    }

    const handleUploadProfilePhoto = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        const response = await axios.post(`/api/users/${id}/profile-photo`, formJson, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
        });

        if (response.status == 200) {
            setCurrentProfilePhoto(response.data);
            window.location.reload();
        }

        setIsLoading(false);
        setFilename(null);
        setPreview(null);
    };

    React.useEffect(() => {
        fetchProfilePhoto();
    }, []);

    return <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}
    >
        {!isLoading && <Avatar
            alt={name}
            src={preview ?? currentProfilePhoto}
            sx={{ m: 1, bgcolor: 'secondary.main', width: 200, height: 200 }}
        />}
        <Box component="form" marginBottom={2} onSubmit={handleUploadProfilePhoto}>
            <Stack spacing={2}>
                <Button
                    component="label"
                    role={undefined}
                    variant="outlined"
                    tabIndex={-1}
                    startIcon={<PhotoCamera />}
                    onChange={(e) => {
                        const objectUrl = URL.createObjectURL(e.target.files[0]);
                        setFilename(e.target.files[0].name);
                        setPreview(objectUrl);
                    }}
                >
                    Upload Profile Photo
                    <VisuallyHiddenInput accept="image/*" type="file" name="profile_photo" defaultValue={filename} />
                </Button>
                {preview && <>
                    <Button
                        type="button"
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                    >
                        Update
                    </Button>
                </>}
            </Stack>
        </Box>
    </Box>;
}