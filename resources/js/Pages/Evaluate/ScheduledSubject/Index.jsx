import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Head, router } from '@inertiajs/react';
import { Avatar, Button, Chip, createTheme, Divider, Paper, TextField } from '@mui/material';
import { Apartment, CardMembership, DateRange, Event, Password, School, Subject } from '@mui/icons-material';
import { ThemeProvider } from '@emotion/react';

export default function Index({
    errors,
    id,
    code,
    // evaluatee
    profilePhoto,
    institutionId,
    assignedTo,
    evaluateeDepartment,
    // subject class
    academicYear,
    semester,
    subject,
    schedule,
    course,
    yearLevel,
    // evaluator
    evaluatorEmail,
}) {
    const theme = createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#960e21',
            },
            secondary: {
                main: '#f50057',
            },
        },
    });

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
        <ThemeProvider theme={theme}>
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
                        <Box textAlign="center">
                        <Avatar src={profilePhoto} sx={{ height: 150, width: 150, margin: "auto" }} />
                        <Typography component="h1" variant="h5">{assignedTo}</Typography>
                        <Chip icon={<CardMembership />} label={institutionId} color="primary" sx={{ mb: 1, mr: 1 }} />
                        <Chip icon={<Apartment />} label={`${evaluateeDepartment.code} - ${evaluateeDepartment.title}`} color="secondary" sx={{ mb: 1, mr: 1 }} />
                        <Divider sx={{ my: 1 }} />
                        <Chip icon={<Password />} label={code} color="success" sx={{ mb: 1, mr: 1 }} />
                        <Chip icon={<DateRange />} label={`${academicYear} - ${semester}`} color="warning" sx={{ mb: 1, mr: 1 }} />
                        <Chip icon={<Subject />} label={`${subject.code} - ${subject.title}`} color="primary" sx={{ mb: 1, mr: 1 }} /><br/>
                        <Chip icon={<Event />} label={schedule} color="info" sx={{ mb: 1, mr: 1 }} />
                        <Chip icon={<School />} label={`(${course.code} - ${yearLevel})`} color="secondary" sx={{ mb: 1, mr: 1 }} />
                        </Box>
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
        </ThemeProvider>
    );
}