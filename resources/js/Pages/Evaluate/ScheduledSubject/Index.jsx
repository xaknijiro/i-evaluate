import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Head, router } from '@inertiajs/react';
import { Avatar, Button, Chip, Divider, Paper, Rating, Stack, TextField } from '@mui/material';
import { AccountCircle, DateRange, Password, School, Subject } from '@mui/icons-material';

export default function Index({ errors, id, code, subject, academicYear, semester, course, yearLevel, assignedTo, evaluatorEmail }) {
    const handleSubmitPasscode = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        router.post(`/evaluation-schedule-subject-class/${id}/validate`, {
            passcode: data.get('passcode'),
        }, {
            preserveScroll: true,
        });
    };

    return (
        <Container component="main" maxWidth="lg">
            <Head>
                <title>{code}</title>
            </Head>
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper sx={{ padding: 2 }}>
                    <Stack spacing={2} alignItems="center">
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <AccountCircle />
                        </Avatar>
                        <Typography component="h1" variant="h5">{assignedTo}</Typography>
                        <Chip icon={<Password />} label={code} color="success" />
                        <Chip icon={<Subject />} label={`${subject.code} - ${subject.title}`} color="primary" />
                        <Chip icon={<School />} label={`(${course.code} - ${yearLevel})`} color="secondary" />
                        <Chip icon={<DateRange />} label={`${academicYear} - ${semester}`} color="warning" />
                    </Stack>
                </Paper>

                <Box component="form" onSubmit={handleSubmitPasscode} noValidate sx={{ mt: 1 }}>
                    <TextField
                        autoComplete="off"
                        defaultValue={evaluatorEmail}
                        margin="normal"
                        disabled
                        fullWidth
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="passcode"
                        label="Passcode"
                        name="passcode"
                        autoComplete="off"
                        autoFocus
                        error={!!errors.passcode}
                        helperText={errors.passcode}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Start
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}