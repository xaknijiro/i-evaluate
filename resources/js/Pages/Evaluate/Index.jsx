import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { PlayArrow } from '@mui/icons-material';
import { Head, router } from '@inertiajs/react';
import { Alert, Snackbar } from '@mui/material';

export default function Index({ errors, flashMessage }) {
    const [openFlashMessage, setOpenFlashMessage] = React.useState(true);
    const handleCloseFlashMessage = (_event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenFlashMessage(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        router.post('/evaluation', {
            evaluation_code: data.get('evaluation_code'),
            evaluator_student_id: data.get('evaluator_student_id'),
            evaluator_email: data.get('evaluator_email'),
        }, {
            preserveScroll: true,
            onSuccess: ({ props }) => setOpenFlashMessage(!!props.flashMessage),
        });
    };

    return (
        <Container component="main" maxWidth="xs">
            <Head>
                <title>Start</title>
            </Head>
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <PlayArrow />
                </Avatar>
                <Typography component="h1" variant="h5">
                    I-Evaluate
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="evaluation_code"
                        label="Evaluation Code"
                        name="evaluation_code"
                        autoComplete="off"
                        autoFocus
                        error={!!errors.evaluation_code}
                        helperText={errors.evaluation_code}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="evaluator_student_id"
                        label="Evaluator Student ID"
                        name="evaluator_student_id"
                        autoComplete="off"
                        error={!!errors.evaluator_student_id}
                        helperText={errors.evaluator_student_id}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="evaluator_email"
                        label="Evaluator Email"
                        name="evaluator_email"
                        autoComplete="off"
                        error={!!errors.evaluator_email}
                        helperText={errors.evaluator_email}
                    />

                    <Snackbar
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                        autoHideDuration={5000}
                        onClose={handleCloseFlashMessage}
                        open={!!flashMessage && openFlashMessage}
                    >
                        <Alert
                            onClose={handleCloseFlashMessage}
                            severity={flashMessage?.severity}
                            sx={{ width: '100%' }}
                            variant="filled"
                        >
                            {flashMessage?.value}
                        </Alert>
                    </Snackbar>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Send Passcode
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}