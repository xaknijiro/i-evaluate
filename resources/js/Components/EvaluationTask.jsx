import * as React from 'react';
import Container from '@mui/material/Container';
import { Alert, AppBar, Box, Button, Dialog, Divider, IconButton, Paper, Rating, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { AccountCircle, Close } from '@mui/icons-material';

export default function EvaluationTask({
    data,
    evaluationSchedule,
    evaluatee,
    evaluatorId,
    errors,
    onClose,
    onSubmit,
    setData,
}) {
    const {
        evaluation_type: evaluationType,
        evaluation_form: evaluationForm,
    } = evaluationSchedule;

    const { likert_scale: likertScale } = evaluationForm || {};
    const { default_options: options } = likertScale || {};
    const evaluateeName = `${evaluatee.last_name}, ${evaluatee.first_name}`;

    return <Dialog
        disableRestoreFocus
        maxWidth="lg"
        open
        onClose={onClose}
        PaperProps={{
            component: 'form',
            onSubmit: (event) => onSubmit(event, evaluatorId),
        }}
        fullScreen
    >
        <AppBar sx={{ position: 'fixed' }}>
            <Toolbar>
                <Typography alignItems='center' component='h1' display='flex' flexGrow={1} variant='h5'>
                    <AccountCircle sx={{ mr: 0.5 }} />{evaluateeName}
                </Typography>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onClose}
                    aria-label="close"
                >
                    <Close />
                </IconButton>
            </Toolbar>
        </AppBar>
        <Container sx={{ mt: 12, mb: 4 }}>
            <Paper
                sx={{
                    marginTop: 2,
                    marginBottom: 2,
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5" gutterBottom>{evaluationType.title}</Typography>
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
            <Box sx={{ mt: 1 }}>
                {evaluationForm.criteria.map((criterion) => <Paper sx={{ marginBottom: 2, padding: 2 }}>
                    <Typography component="h5" variant="h5" gutterBottom>{criterion.description}</Typography>
                    <Stack spacing={1}>
                        {criterion.indicators.map((indicator) => <Paper sx={{ padding: 2 }} variant="outlined">
                            <Typography>{indicator.description}</Typography>
                            {criterion.is_weighted
                                ? <Rating
                                    max={likertScale.max_score}
                                    onChange={(_event, value) => {
                                        setData({
                                            ...data,
                                            [`indicator-${indicator.id}`]: value,
                                        })
                                    }}
                                    name={`indicator-${indicator.id}`}
                                    size="large" />
                                : <TextField
                                    fullWidth
                                    multiline
                                    inputProps={{ maxLength: 1000 }}
                                    name={`indicator-${indicator.id}`}
                                    rows={10} />}
                            {!!errors[`indicator-${indicator.id}`] &&
                                <Alert severity="error" variant="filled">The rating is required.</Alert>}
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
    </Dialog>;
}