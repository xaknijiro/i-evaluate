import * as React from 'react';
import Container from '@mui/material/Container';
import { Head, router } from '@inertiajs/react';
import { Alert, AppBar, Avatar, Box, Button, Chip, createTheme, Divider, Paper, Rating, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { Apartment, CardMembership, DateRange, Event, Password, School, Subject } from '@mui/icons-material';
import { ThemeProvider } from '@emotion/react';

export default function Show({
    errors,
    id,
    code,
    // evaluatee
    institutionId,
    profilePhoto,
    assignedTo,
    evaluateeDepartment,
    // subject class
    academicYear,
    semester,
    subject,
    schedule,
    course,
    yearLevel,
    // evaluation references
    evaluationType,
    evaluationForm,
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
    
    const { likert_scale: likertScale } = evaluationForm || {};
    const { default_options: options } = likertScale || {};

    const handleSubmitEvaluation = (event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        const payloadData = {};
        for (const key of data.keys()) {
            payloadData[key] = data.get(key);
        }

        router.patch(
            `/evaluation-schedule-subject-class/${id}`,
            payloadData,
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <ThemeProvider theme={theme}>
            <React.Fragment>
                <AppBar position="fixed">
                    <Toolbar>
                        <Avatar src={profilePhoto} sx={{ height: 150, width: 150, m: 2 }}/>    
                        <Box padding={2}>
                            <Stack alignItems="center" direction="row" marginBottom={1} spacing={1}>
                                <Typography component="h1" variant="h5">
                                    {assignedTo}
                                </Typography>
                            </Stack>
                            <Stack direction="row" marginBottom={1} spacing={1}>
                                <Chip icon={<CardMembership />} label={institutionId} color="error" />
                                <Chip icon={<Apartment />} label={`${evaluateeDepartment.code} - ${evaluateeDepartment.title}`} color="secondary" />
                            </Stack>
                            
                        </Box>
                        <Paper sx={{ bgcolor: 'warning.light',  p: 2 }}>
                            <Stack alignItems="center" direction="row" marginBottom={1} spacing={1}>
                                <Typography component="h1" variant="h5">
                                    Subject Class
                                </Typography>
                            </Stack>
                            <Divider sx={{ my: 1 }}/>
                            <Stack direction="row" marginBottom={1} spacing={1}>
                                <Chip icon={<Password />} label={code} color="success" />
                                <Chip icon={<DateRange />} label={`${academicYear} - ${semester}`} color="warning" />
                                <Chip icon={<Subject />} label={`${subject.code} - ${subject.title}`} color="error" />
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Chip icon={<Event />} label={schedule} color="info" />
                                <Chip icon={<School />} label={`(${course.code} - ${yearLevel})`} color="secondary" />
                            </Stack>
                        </Paper>
                    </Toolbar>
                </AppBar>
                <Toolbar />
            </React.Fragment>
            <Container component="main" maxWidth="lg">
                <Head>
                    <title>{code}</title>
                </Head>
                <Paper
                    sx={{
                        marginTop: 16,
                        marginBottom: 4,
                        padding: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5" gutterBottom>{evaluationType}</Typography>
                    <Typography variant="body1" gutterBottom>{evaluationForm.description}</Typography>
                    <Stack
                        direction={{ sm: "column", md: "row" }}
                        divider={<Divider orientation="vertical" flexItem />}
                        flexWrap="wrap"
                        spacing={{ xs: 1, sm: 2 }}
                        useFlexGap>
                        {options.map((option, i) =>
                            <Box
                                key={`option-${i}`}
                                alignItems="center"
                                textAlign="center">
                                <Rating
                                    defaultValue={option.value}
                                    size="large"
                                    disabled
                                />
                                <Typography>{option.label}</Typography>
                            </Box>)}
                    </Stack>
                </Paper>
                <Box component="form" onSubmit={handleSubmitEvaluation} sx={{ mt: 1 }}>
                    {evaluationForm.criteria.map((criterion) => <Paper sx={{ marginBottom: 2, padding: 2 }}>
                        <Typography component="h5" variant="h5" gutterBottom>{criterion.description}</Typography>
                        <Stack spacing={1}>
                        {criterion.indicators.map((indicator) => <Paper sx={{ padding: 2 }} variant="outlined">
                                <Typography>{indicator.description}</Typography>
                                {criterion.is_weighted
                                    ? <Rating max={likertScale.max_score} name={`indicator-${indicator.id}`} size="large" />
                                    : <TextField
                                        fullWidth
                                        multiline
                                        inputProps={{ maxLength: 1000 }}
                                        name={`indicator-${indicator.id}`}
                                        rows={10}/>}
                                {!!errors[`indicator-${indicator.id}`] && <Alert severity="error" variant="filled">The rating is required.</Alert>}
                            </Paper>)}
                        </Stack>
                    </Paper>)}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Submit
                    </Button>
                </Box>
            </Container>
        </ThemeProvider>
    );
}