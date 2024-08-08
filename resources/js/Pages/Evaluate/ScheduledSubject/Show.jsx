import * as React from 'react';
import Container from '@mui/material/Container';
import { Head, router } from '@inertiajs/react';
import { Alert, AppBar, Box, Button, Chip, createTheme, Divider, Icon, Paper, Rating, Stack, Toolbar, Typography } from '@mui/material';
import { AccountCircle, DateRange, Password, School, Subject } from '@mui/icons-material';
import { ThemeProvider } from '@emotion/react';

export default function Show({ errors, id, code, subject, academicYear, semester, course, yearLevel, assignedTo, evaluationType, evaluationForm }) {
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
                        <Box padding={2}>
                            <Stack alignItems="center" direction="row" marginBottom={2} spacing={1}>
                                <AccountCircle />
                                <Typography component="h1" variant="h5">
                                    {assignedTo}
                                </Typography>
                            </Stack>
                            <Stack direction="row" divider={<Divider orientation="vertical" />} spacing={1}>
                                <Chip icon={<Password />} label={code} color="success" />
                                <Chip icon={<Subject />} label={`${subject.code} - ${subject.title}`} color="default" />
                                <Chip icon={<School />} label={`(${course.code} - ${yearLevel})`} color="secondary" />
                                <Chip icon={<DateRange />} label={`${academicYear} - ${semester}`} color="warning" />
                            </Stack>
                        </Box>
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
                        marginTop: 8,
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
                                <Rating max={likertScale.max_score} name={`indicator-${indicator.id}`} size="large" />
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