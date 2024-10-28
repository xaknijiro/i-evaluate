import { Accordion, AccordionDetails, AccordionSummary, AppBar, Badge, Box, Button, Card, CardContent, CardHeader, Chip, Container, Dialog, Divider, FormLabel, Grid, IconButton, Link, Pagination, Paper, Rating, Stack, styled, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField, Toolbar, Typography, useTheme } from "@mui/material";
import { Apartment, ArrowDownward, Calculate, CardMembership, Check, Close, CloudUpload, Description, Email, Event, Grading, Group, HourglassTop, Password, People, PersonPin, PictureAsPdf, Queue, School, Score, Subject, ViewAgenda } from "@mui/icons-material";
import React, { useCallback, useMemo, useRef } from 'react';
import { router, useForm, usePage } from "@inertiajs/react";
import MainLayout from "../../../MainLayout";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { BarChart, Gauge } from "@mui/x-charts";
import { find, includes, sortBy } from "lodash";
import { Margin } from "react-to-pdf";
import generatePDF from "react-to-pdf";

const BarChartCommonSettings = (theme) => ({
    colors: [theme.palette.info.main],
    height: 175,
    sx: {
        display: "inline-block",
    },
    width: 250,
});

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

const List = ({ errors, evaluationSchedule, evaluatees }) => {
    const theme = useTheme();

    const { auth, filters } = usePage().props;
    const { roles } = auth;

    const { meta: evaluateesPaginationMeta } = evaluatees;

    const { id, academic_year: academicYear, semester, evaluation_type: evaluationType, evaluation_form: evaluationForm, is_open: evaluationScheduleIsOpen } = evaluationSchedule.data;
    const { likert_scale: likertScale } = evaluationForm || {};
    const { default_options: likertScaleOptions } = likertScale || {};

    const likertScaleLegend = useCallback(() => likertScaleOptions && <TableContainer component={Paper} variant="outlined">
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Rating Scale</TableCell>
                    <TableCell>Percentile Equivalent</TableCell>
                    <TableCell>Descriptive Equivalent</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {sortBy(likertScaleOptions, 'value').reverse().map((option) => <TableRow>
                    <TableCell>{option.scale_range[0].toFixed(2)} - {option.scale_range[1].toFixed(2)}</TableCell>
                    <TableCell>{sortBy(option.percentile_range, (p) => p[1]).reverse().map((p) => <>({p[0][0].toFixed(2)} - {p[0][1].toFixed(2)} = {p[1]}%) </>)}</TableCell>
                    <TableCell>{option.label}</TableCell>
                </TableRow>)}
            </TableBody>
        </Table>
    </TableContainer>);

    const [evaluateeEvaluationClassRoster, setEvaluateeEvaluationClassRoster] = React.useState(null);
    const [evaluateeEvaluationResultPerClass, setEvaluateeEvaluationResultPerClass] = React.useState(null);
    const [evaluateeSubjectClassId, setEvaluateeSubjectClassId] = React.useState(null);
    
    const [evaluateeEvaluationResultSummary, setEvaluateeEvaluationResultSummary] = React.useState(null);

    const {
        data: classRosterData,
        setData: setClassRosterData,
        post: postClassRoster,
        errors: classRosterErrors,
        reset: resetClassRosterForm,
    } = useForm({
        class_roster: null,
    });

    const targetRefQuickSearch = useRef();
    const targetRefEvaluationClassRoster = useRef();
    const targetRefEvaluationResultPerClass = useRef();
    const targetRefEvaluationResultSummary = useRef();

    const handleImport = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        router.post(`/evaluation-schedules/${id}/evaluatees`, formJson, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    const handleEvaluateesPageChange = (_event, value) => {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('page', value);

        router.get(
            `/evaluation-schedules/${id}/evaluatees?${queryParams.toString()}`,
            { },
            { preserveScroll: true }
        );
    };

    const handleCalculateResult = (params) => {
        const { row } = params;
        const { evaluation } = row;
        router.post(`/calculate-evaluation-result/${evaluation.id}`, {}, {
            preserveScroll: true,
        });
    };

    const handleEvaluationClassRoster = useMemo(() => (subjectClassId) => {
        const evaluatee = evaluatees.data.find((evaluatee) => {
            return evaluatee.subject_classes.find((subjectClass) => subjectClass.id === subjectClassId);
        });

        resetClassRosterForm();
        setEvaluateeEvaluationClassRoster(evaluatee);
        setEvaluateeSubjectClassId(subjectClassId);
    });

    const handleCloseEvaluationClassRoster = useMemo(() => () => {
        resetClassRosterForm();
        setEvaluateeEvaluationClassRoster(null);
        setEvaluateeSubjectClassId(null);
    });

    const handleEvaluationResultPerClassDetails = useMemo(() => (subjectClassId) => {
        const evaluatee = evaluatees.data.find((evaluatee) => {
            return evaluatee.subject_classes.find((subjectClass) => subjectClass.id === subjectClassId);
        });

        setEvaluateeEvaluationResultPerClass(evaluatee);
        setEvaluateeSubjectClassId(subjectClassId);
    });

    const handleCloseEvaluationResultPerClassDetails = useMemo(() => () => {
        setEvaluateeEvaluationResultPerClass(null);
        setEvaluateeSubjectClassId(null);
    });

    const handleEvaluationResultSummary = useMemo(() => (evaluateeEvaluationResultSummary) => {
        setEvaluateeEvaluationResultSummary(evaluateeEvaluationResultSummary);
    });

    const handleCloseEvaluationResultSummary = useMemo(() => () => {
        setEvaluateeEvaluationResultSummary(null);
    });

    const evaluationClassRoster = useMemo(() => (evaluatee, subjectClassId) => {
        const {
            department: evaluateeDepartment,
            email: evaluateeEmail,
            institution_id: evaluateeInstitutionId,
            last_name: evaluateeLastName,
            first_name: evaluateeFirstName,
            subject_classes: evaluateeSubjectClasses,
        } = evaluatee;
        const evaluateeFullName = `${evaluateeLastName}, ${evaluateeFirstName}`;
        const evaluateeSubjectClass = evaluateeSubjectClasses.find((subjectClass) => subjectClass.id === subjectClassId);
        const {
            course: evaluateeSubjectClassCourse,
            evaluation: evaluateeSubjectClassEvaluation,
            subject: evaluateeSubjectClassSubject,
        } = evaluateeSubjectClass || {};

        const {
            evaluators: evaluateeSubjectClassEvaluationEvaluators,
            is_open: evaluateeSubjectClassEvaluationIsOpen,
        } = evaluateeSubjectClassEvaluation || {};
        
        return <Dialog
            maxWidth="lg"
            open={!!evaluateeSubjectClass}
            onClose={handleCloseEvaluationClassRoster}
            PaperProps={{
                component: 'form',
                onSubmit: (event) => {
                    event.preventDefault();
                    postClassRoster(`/evaluation-schedules/${id}/subject-classes/${evaluateeSubjectClassEvaluation.id}/class-rosters`, {
                        onSuccess: () => {
                            resetClassRosterForm();
                            handleCloseEvaluationClassRoster();
                        }
                    });
                },
            }}
            fullScreen
        >
            <AppBar sx={{ position: 'fixed' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleCloseEvaluationClassRoster}
                        aria-label="close"
                    >
                        <Close />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Class Evaluation Roster
                    </Typography>
                    <IconButton color="inherit" onClick={() => false}>
                        <PictureAsPdf />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 12, mb: 4 }}>
            <Box ref={targetRefEvaluationResultSummary} sx={{ p: 2 }}>
                    <Typography
                        variant="h4"
                        textAlign="center"

                    >
                        {evaluationType.title} Roster
                    </Typography>
                    <Typography
                        gutterBottom
                        variant="subtitle1"
                        textAlign="center"
                    >
                        {semester} A.Y. {academicYear}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={1}>
                        <Grid item md={6}>
                            <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center" marginBottom={2}>
                                    <PersonPin />
                                    <Typography variant="h5" display="inline">{evaluateeFullName}</Typography>
                                </Stack>
                                <Stack spacing={1}>
                                    <Chip color="primary" icon={<CardMembership />} label={evaluateeInstitutionId} />
                                    <Chip color="default" icon={<Apartment />} label={evaluateeDepartment?.title} />
                                    <Chip color="default" icon={<Email />} label={evaluateeEmail} />
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item md={6}>
                            <Paper sx={{ mb: 2, p: 2 }} variant="outlined">
                                <Stack direction="row" spacing={1} alignItems="center" marginBottom={2}>
                                    <Password />
                                    <Typography variant="h5" display="inline">{evaluateeSubjectClassEvaluation.code}</Typography>
                                </Stack>
                                <Stack spacing={1}>
                                    <Chip color="secondary" icon={<Subject />} label={`(${evaluateeSubjectClass.section}) ${evaluateeSubjectClassSubject.code} - ${evaluateeSubjectClassSubject.title}`} />
                                    <Chip icon={<Event />} label={evaluateeSubjectClass.schedule} />
                                    <Chip icon={<School />} label={`${evaluateeSubjectClassCourse.code} ${evaluateeSubjectClass.year_level}`} />
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item md={!evaluateeSubjectClassEvaluationIsOpen ? 12 : (!includes(roles, 'Evaluation Manager') ? 12 : 6)} sm={12} xs={12}>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Student ID</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Responded</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {evaluateeSubjectClassEvaluationEvaluators && evaluateeSubjectClassEvaluationEvaluators.map((evaluator) => <TableRow
                                            key={evaluator.id}
                                        >
                                            <TableCell>{evaluator.institution_id}</TableCell>
                                            <TableCell>{evaluator.email}</TableCell>
                                            <TableCell>{!!evaluator.submitted ? <Check htmlColor="green" /> : null}</TableCell>
                                        </TableRow>)}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        {includes(roles, 'Evaluation Manager') && evaluateeSubjectClassEvaluationIsOpen && <Grid item md={6} sm={12} xs={12}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <FormLabel>Enter student ID separated by line break.</FormLabel>
                                <TextField
                                    ref={targetRefEvaluationClassRoster}
                                    error={!!classRosterErrors.class_roster}
                                    helperText={classRosterErrors?.class_roster}
                                    margin="dense"
                                    maxRows={30}
                                    minRows={10}
                                    name="class_roster"
                                    onChange={(e) => targetRefEvaluationClassRoster.current.value = e.target.value}
                                    onBlur={() => setClassRosterData({ class_roster: targetRefEvaluationClassRoster.current.value })}
                                    defaultValue={classRosterData.class_roster}
                                    autoFocus
                                    fullWidth
                                    multiline
                                />
                                <Button variant="contained" type="submit" fullWidth>Submit</Button>
                            </Paper>
                        </Grid>}
                    </Grid>
                </Box>
            </Container>
        </Dialog>;
    });

    const evaluationResultPerClassDetails = useMemo(() => (evaluatee, subjectClassId) => {
        const {
            department: evaluateeDepartment,
            email: evaluateeEmail,
            institution_id: evaluateeInstitutionId,
            last_name: evaluateeLastName,
            first_name: evaluateeFirstName,
            subject_classes: evaluateeSubjectClasses,
        } = evaluatee;
        const evaluateeFullName = `${evaluateeLastName}, ${evaluateeFirstName}`;
        const evaluateeSubjectClass = evaluateeSubjectClasses.find((subjectClass) => subjectClass.id === subjectClassId);
        const {
            course: evaluateeSubjectClassCourse,
            evaluation: evaluateeSubjectClassEvaluation,
            subject: evaluateeSubjectClassSubject
        } = evaluateeSubjectClass;

        const { result: evaluationResultDetails } = evaluateeSubjectClassEvaluation;

        return <Dialog
            open={!!evaluatee && !!subjectClassId}
            onClose={handleCloseEvaluationResultPerClassDetails}
            fullScreen
        >
            <AppBar sx={{ position: 'fixed' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleCloseEvaluationResultPerClassDetails}
                        aria-label="close"
                    >
                        <Close />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Per Class Evaluation Result
                    </Typography>
                    <IconButton color="inherit" onClick={() => generatePDF(targetRefEvaluationResultPerClass, {
                        filename: `${evaluateeInstitutionId}-${evaluateeSubjectClassEvaluation.code}-student-to-teacher-evaluation-result.pdf`,
                        page: {
                            margin: Margin.MEDIUM,
                        }
                    })}>
                        <PictureAsPdf />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 12, mb: 4 }}>
                <div ref={targetRefEvaluationResultPerClass}>
                    <Box sx={{ p: 2 }}>
                        <Typography
                            variant="h5"
                            textAlign="center"
                        >
                            {evaluationType.title} Result
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            textAlign="center"
                            gutterBottom
                        >
                            {semester} A.Y. {academicYear}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item md={4} sm={12} xs={12}>
                                <Paper sx={{ mb: 2, p: 2 }} variant="outlined">
                                    <Stack direction="row" spacing={1} alignItems="center" marginBottom={2}>
                                        <PersonPin />
                                        <Typography variant="h5" display="inline">{evaluateeFullName}</Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Chip color="primary" icon={<CardMembership />} label={evaluateeInstitutionId} />
                                        <Chip color="default" icon={<Apartment />} label={evaluateeDepartment?.title} />
                                        <Chip color="default" icon={<Email />} label={evaluateeEmail} />
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item md={4} sm={12} xs={12}>
                                <Paper sx={{ mb: 2, p: 2 }} variant="outlined">
                                    <Stack direction="row" spacing={1} alignItems="center" marginBottom={2}>
                                        <Password />
                                        <Typography variant="h5" display="inline">{evaluateeSubjectClassEvaluation.code}</Typography>
                                    </Stack>
                                    <Stack spacing={1}>
                                        <Chip color="primary" icon={<Subject />} label={`(${evaluateeSubjectClass.section}) ${evaluateeSubjectClassSubject.code} - ${evaluateeSubjectClassSubject.title}`} />
                                        <Chip icon={<Event />} label={evaluateeSubjectClass.schedule} />
                                        <Chip icon={<School />} label={`${evaluateeSubjectClassCourse.code} ${evaluateeSubjectClass.year_level}`} />
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item md={4} sm={12} xs={12}>
                                <Paper sx={{ mb: 2, p: 2 }} variant="outlined">
                                    <Stack direction="row" spacing={1} alignItems="center" marginBottom={2}>
                                        <Score />
                                        <Typography variant="h5" display="inline">Overall Rating</Typography>
                                    </Stack>
                                    <Stack spacing={1} sx={{ mb: 1.5 }}>
                                        <Chip color="primary" icon={<Calculate />} label={`${evaluationResultDetails?.details?.overall_rating.toFixed(2) || 0} (${evaluationResultDetails?.details?.percentile_equivalent || ''}%)`} />
                                        <Chip icon={<Description />} label={evaluationResultDetails?.details?.descriptive_equivalent || ''} />
                                    </Stack>
                                    <Rating
                                        precision={0.1}
                                        value={evaluationResultDetails?.details?.overall_rating.toFixed(2) || 0}
                                        readOnly />
                                </Paper>
                            </Grid>
                        </Grid>

                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                            <Table size="small">
                                <caption style={{ captionSide: "top", textAlign: "center" }}>
                                    Class Evaluation Result Summary
                                    <Divider sx={{ my: 1 }} />
                                </caption>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Criterion</TableCell>
                                        <TableCell align="center">Rating</TableCell>
                                        <TableCell align="center">Weight</TableCell>
                                        <TableCell align="center">Weighted Rating</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {evaluationForm.criteria.filter((criterion) => criterion.is_weighted).map((criterion) => {
                                        const { details } = evaluationResultDetails || {};
                                        const { criteria } = details || [];
                                        const criterionResult = find(criteria, { id: criterion.id });
                                        return <TableRow key={criterion.id}>
                                            <TableCell width="60%">{criterion.description}</TableCell>
                                            <TableCell align="center">{criterionResult?.rating.toFixed(2) || 0}</TableCell>
                                            <TableCell align="center">{criterion.weight * 100}%</TableCell>
                                            <TableCell align="center">{criterionResult?.weighted_rating.toFixed(2) || 0}</TableCell>
                                        </TableRow>;
                                    })}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell align="right" colSpan={3}>Overall Rating</TableCell>
                                        <TableCell align="center">
                                            {evaluationResultDetails?.details?.overall_rating.toFixed(2) || 0} ({evaluationResultDetails?.details?.percentile_equivalent || 0}%)
                                            ({evaluationResultDetails?.details?.descriptive_equivalent || ''})<br/>
                                            <Rating
                                                precision={0.1}
                                                value={evaluationResultDetails?.details?.overall_rating.toFixed(2) || 0}
                                                size="small"
                                                readOnly />
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mb: 2 }}>{likertScaleLegend()}</Box>

                        <Typography
                            variant="h6"
                            textAlign="center"
                            gutterBottom
                            sx={{ mt: 4 }}
                        >
                            Class Evaluation Responses Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {evaluationForm.criteria.filter((criterion) => criterion.is_weighted).map((criterion) => {
                            const { details } = evaluationResultDetails || {};
                            const { criteria } = details || [];
                            const criterionResult = find(criteria, { id: criterion.id });
                            const {
                                responses: criterionResponses,
                                rating: criterionRating,
                                total_points: criterionTotalPoints,
                                weight: criterionWeight,
                                weighted_rating: criterionWeightedRating
                            } = criterionResult || {};

                            return <Accordion expanded key={criterion.id} variant="outlined">
                                <AccordionSummary>
                                    <Typography flex={1} variant="h6">{criterion.description}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell width="50%">Indicator</TableCell>
                                                    <TableCell align="center" width="25%">Tally</TableCell>
                                                    <TableCell align="center">Total Points</TableCell>
                                                    <TableCell align="center">Responses</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {criterion.indicators.map((indicator, index) => {
                                                    const { indicators: indicatorsResult } = criterionResult || {};
                                                    const indicatorResult = find(indicatorsResult, { id: indicator.id });
                                                    const {
                                                        responses: indicatorResponses,
                                                        total_points: indicatorTotalPoints,
                                                        tally
                                                    } = indicatorResult || {};
                                                    const data = [0, 0, 0, 0, 0];

                                                    if (tally) {
                                                        tally.forEach(({ value, count }) => {
                                                            data[value - 1] = count;
                                                        });
                                                    }

                                                    return <TableRow key={indicator.id}>
                                                        <TableCell>{index + 1}. {indicator.description}</TableCell>
                                                        <TableCell align="center">
                                                            <BarChart
                                                                {...BarChartCommonSettings(theme)}
                                                                xAxis={[{
                                                                    scaleType: 'band',
                                                                    data: [1, 2, 3, 4, 5],
                                                                    label: 'Rating',
                                                                }]}
                                                                yAxis={[{
                                                                    tickMinStep: 1,
                                                                    label: 'Respondent',
                                                                }]}
                                                                series={[{ data: data }]}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">{indicatorTotalPoints || 0}</TableCell>
                                                        <TableCell align="center">{indicatorResponses || 0}</TableCell>
                                                    </TableRow>;
                                                })}
                                            </TableBody>
                                            <TableFooter>
                                                <TableRow>
                                                    <TableCell colSpan={4}>
                                                        <Typography variant="h6">Criterion Rating</Typography>
                                                        <Stack direction="row" spacing={2}>
                                                            <Typography>Total Points: {criterionTotalPoints || 0}</Typography>
                                                            <Typography>Responses: {criterionResponses || 0}</Typography>
                                                            <Typography>Rating: {criterionRating.toFixed(2)}</Typography>
                                                            <Rating precision={0.1} value={criterionRating.toFixed(2) || 0} readOnly />
                                                            <Typography>Weight: {(criterionWeight || 0) * 100}%</Typography>
                                                            <Typography>Weighted Rating: {criterionWeightedRating.toFixed(2) || 0}</Typography>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>;
                        })}
                        {evaluationForm.criteria.filter((criterion) => !criterion.is_weighted).map((criterion) => {
                            const { details } = evaluationResultDetails || {};
                            const { criteria } = details || [];
                            const criterionResult = find(criteria, { id: criterion.id });

                            return <Accordion expanded key={criterion.id} variant="outlined">
                                <AccordionSummary>
                                    <Typography flex={1} variant="h6">{criterion.description}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {criterion.indicators.map((indicator, index) => {
                                        const { indicators: indicatorsResult } = criterionResult || {};
                                        const indicatorResult = find(indicatorsResult, { id: indicator.id });
                                        const { tally } = indicatorResult || [];
                                        const { comments } = tally[0] || [];

                                        return <Box key={indicator.id} sx={{ mb: 2 }}>
                                            <Typography sx={{ mb: 2 }}>{index + 1}. {indicator.description}</Typography>
                                            <Typography><div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: comments }}></div></Typography>
                                        </Box>;
                                    })}
                                </AccordionDetails>
                            </Accordion>;
                        })}
                    </Box>
                </div>
            </Container>
        </Dialog>;
    });

    const evaluationResultSummaryDetails = useMemo(() => (evaluatee) => {
        const {
            department,
            email,
            last_name: lastName,
            first_name: firstName,
            institution_id: institutionId,
            subject_classes: subjectClasses,
            evaluation_result_summary: evaluationResultSummary,
        } = evaluatee;

        const fullName = `${lastName}, ${firstName}`;
        const subjectClassesEvaluated  = subjectClasses.filter((subjectClass) => !!subjectClass.evaluation &&
            !subjectClass.evaluation.is_open && !!subjectClass.evaluation.result);
        const {
            overall_rating: evaluationOverallRating,
            descriptive_equivalent: evaluationOverallRatingDescriptiveEquivalent,
            percentile_equivalent: evaluationOverallRatingPercentileEquivalent,
        } = evaluationResultSummary;

        return <Dialog
            open
            onClose={handleCloseEvaluationResultSummary}
            fullScreen
        >
            <AppBar sx={{ position: 'fixed' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleCloseEvaluationResultSummary}
                        aria-label="close"
                    >
                        <Close />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        {`${evaluationScheduleIsOpen ? '(Tentative) ' : ''}Evaluation Result Summary`}
                    </Typography>
                    <IconButton color="inherit" onClick={() => generatePDF(targetRefEvaluationResultSummary, {
                        filename: `${institutionId}-${evaluationScheduleIsOpen ? 'tentative' : 'final'}-student-to-teacher-evaluation-result-summary.pdf`,
                        page: {
                            method: 'save',
                            margin: Margin.SMALL,
                            size: 'a4',
                        }
                    })}>
                        <PictureAsPdf />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 12, mb: 4 }}>
                <Box ref={targetRefEvaluationResultSummary} sx={{ p: 2 }}>
                    <Typography
                        variant="h5"
                        textAlign="center"

                    >
                        {evaluationType.title} Result
                    </Typography>
                    <Typography
                        gutterBottom
                        variant="subtitle1"
                        textAlign="center"
                    >
                        {semester} A.Y. {academicYear}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={1}>
                        <Grid item md={6}>
                            <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center" marginBottom={2}>
                                    <PersonPin />
                                    <Typography variant="h5" display="inline">{fullName}</Typography>
                                </Stack>
                                <Stack spacing={1}>
                                    <Chip color="primary" icon={<CardMembership />} label={institutionId} />
                                    <Chip color="default" icon={<Apartment />} label={department?.title} />
                                    <Chip color="default" icon={<Email />} label={email} />
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item md={6}>
                            <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center" marginBottom={2}>
                                    <Score />
                                    <Typography variant="h5" display="inline">Overall Rating</Typography>
                                </Stack>
                                <Stack spacing={1}>
                                    <Chip color="primary" icon={<Calculate />} label={`${evaluationOverallRating.toFixed(2) || 0} (${evaluationOverallRatingPercentileEquivalent || 0}%)`} />
                                    <Chip color="default" icon={<Description />} label={evaluationOverallRatingDescriptiveEquivalent} />
                                </Stack>
                                <Rating precision={0.1} value={evaluationOverallRating || 0} size="large" readOnly sx={{ mt: 1 }}/>
                            </Paper>
                        </Grid>
                    </Grid>

                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <caption style={{ captionSide: "top", textAlign: "center" }}>
                                Per Class Evaluation Result
                                <Divider sx={{ my: 1 }} />
                            </caption>
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Section</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>Course/Yr.</TableCell>
                                    <TableCell>Schedule</TableCell>
                                    <TableCell align="center">Rating</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subjectClassesEvaluated.map((subjectClass, index) => {
                                    const {
                                        course: subjectClassCourse,
                                        evaluation: subjectClassEvaluation,
                                        section: subjectClassSection,
                                        schedule: subjectClassSchedule,
                                        subject: subjectClassSubject,
                                        year_level: subjectClassYearLevel,
                                    } = subjectClass || {};
                                    const { result: subjectClassEvaluationResult } = subjectClassEvaluation || {};
                                    const { details: subjectClassEvaluationResultDetails } = subjectClassEvaluationResult || {};
                                    const {
                                        overall_rating: subjectClassOverallRating,
                                        descriptive_equivalent: subjectClassRatingDescriptiveEquivalent,
                                    } = subjectClassEvaluationResultDetails || {};
                                    return <TableRow key={subjectClass.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{subjectClassSection}</TableCell>
                                        <TableCell>{subjectClassSubject.code} - {subjectClassSubject.title}</TableCell>
                                        <TableCell>{subjectClassCourse.code} {subjectClassYearLevel}</TableCell>
                                        <TableCell>{subjectClassSchedule}</TableCell>
                                        <TableCell align="center">
                                            {subjectClassOverallRating.toFixed(2)} ({subjectClassRatingDescriptiveEquivalent})<br />
                                            <Rating precision={0.1} value={subjectClassOverallRating} size="small" readOnly />
                                        </TableCell>
                                    </TableRow>;
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                        <Table size="small">
                            <caption style={{ captionSide: "top", textAlign: "center" }}>
                                Overall Evaluation Result
                                <Divider sx={{ my: 1 }} />
                            </caption>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Criterion</TableCell>
                                    {subjectClassesEvaluated.map((subjectClass, index) => {
                                        return <TableCell key={subjectClass.id} align="center">{index + 1}</TableCell>;
                                    })}
                                    <TableCell align="center">Ave. Rating</TableCell>
                                    <TableCell align="center">Weight</TableCell>
                                    <TableCell align="center">Weighted Rating</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {evaluationForm.criteria.filter((criterion) => criterion.is_weighted).map((criterion) => {
                                    const criterionResultSummary = find(evaluationResultSummary.criteria, { id: criterion.id });
                                    const {
                                        ave_rating: criterionAveRating,
                                        weight: criterionWeight,
                                        weighted_rating: criterionWeightedRating
                                    } = criterionResultSummary;
                                    return <TableRow key={`${evaluatee.id}-${criterion.id}`}>
                                        <TableCell>{criterion.description}</TableCell>
                                        {subjectClassesEvaluated.map((subjectClass) => {
                                            const { evaluation } = subjectClass;
                                            const { result } = evaluation;
                                            const { details } = result;
                                            const { criteria } = details;
                                            const criterionResult = find(criteria, { id: criterion.id });
                                            return <TableCell align="center">{criterionResult.rating.toFixed(2)}</TableCell>;
                                        })}
                                        <TableCell align="center">{criterionAveRating.toFixed(2)}</TableCell>
                                        <TableCell align="center">{criterionWeight * 100}%</TableCell>
                                        <TableCell align="center">{criterionWeightedRating.toFixed(2)}</TableCell>
                                    </TableRow>
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell align="right" colSpan={3 + subjectClassesEvaluated.length}>Overall Rating</TableCell>
                                    <TableCell align="center">
                                        {evaluationOverallRating.toFixed(2)} ({evaluationOverallRatingPercentileEquivalent}%) ({evaluationOverallRatingDescriptiveEquivalent})<br />
                                        <Rating precision={0.1} value={evaluationOverallRating} size="small" readOnly />
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>

                    <Box sx={{ mt: 2, pageBreakAfter: "always" }}>{likertScaleLegend()}</Box>

                    {evaluationForm.criteria.filter((criterion) => !criterion.is_weighted).map((criterion) => {
                        const { indicators } = criterion;
                        return <Paper key={`${evaluatee.id}-${criterion.id}`} variant="outlined" sx={{ mb: 2, mt: 2, p: 2 }}>
                            <Typography sx={{ mb: 2 }}>{criterion.description}</Typography>
                            {indicators.map((indicator, index) => {
                                const { description } = indicator;
                                return <Box key={`${evaluatee.id}-${criterion.id}-${indicator.id}`} sx={{ mb: 2 }}>
                                    <Typography sx={{ mb: 2 }}>{index + 1}. {description}</Typography>
                                    {subjectClassesEvaluated.map((subjectClass) => {
                                        const { evaluation, section, subject } = subjectClass;
                                        const { code: subjectCode, title: subjectTitle } = subject;
                                        const { result } = evaluation;
                                        const { details } = result;
                                        const { criteria } = details;
                                        const criterionResult = find(criteria, { id: criterion.id });
                                        const { indicators: criterionIndicators } = criterionResult;
                                        const indicatorResult = find(criterionIndicators, { id: indicator.id });
                                        const { tally } = indicatorResult;
                                        const comments = tally[0].comments;
                                        return <Box sx={{ mb: 2,  ml: 2}}>
                                            <Typography variant="caption">({section}) {subjectCode} - {subjectTitle}</Typography>
                                            <Typography><div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: comments }} /></Typography>
                                        </Box>;
                                    })}
                                </Box>
                            })}
                        </Paper>;
                    })}
                </Box>
            </Container>
        </Dialog>;
    });

    return (
        <>
            <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item md={includes(roles, 'Evaluation Manager') && !evaluationScheduleIsOpen ? 12 : 8} sm={12} xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h4">{evaluationType.title}</Typography>
                        <Typography variant="subtitle1">{semester} A.Y. {academicYear}</Typography>
                        <Link onClick={() => window.history.back()}>Back</Link>
                    </Paper>
                </Grid>
                {includes(roles, 'Evaluation Manager') && evaluationScheduleIsOpen && <Grid item md={4} sm={12} xs={12}>
                    <Paper variant="outlined" sx={{ p: 2}}>
                        <Box component="form" marginBottom={2} onSubmit={handleImport}>
                            <Stack spacing={2}>
                                <Button
                                    component="label"
                                    role={undefined}
                                    variant="outlined"
                                    tabIndex={-1}
                                    startIcon={<CloudUpload />}
                                    onSubmit={handleImport}
                                >
                                    Upload Classes
                                    <VisuallyHiddenInput type="file" name="classes" />
                                </Button>
                                {!!errors.classes ? <p style={{ color: 'red' }}>{errors.classes}</p> : null}
                                <input type="hidden" name="from_import" value={1} />
                                <Button
                                    type="submit"
                                    variant="contained"
                                >
                                    Import
                                </Button>
                            </Stack>
                        </Box>
                        <Link
                            href="/import-templates/classes"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Dowload Template
                        </Link>
                    </Paper>
                </Grid>}
            </Grid>

            {includes(roles, 'Evaluation Manager') && <Grid container marginBottom={2} spacing={1}>
                <Grid item md={4} sm={12} xs={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Group fontSize="large" />
                            <Typography>Instructors</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Queue fontSize="large" />
                            <Typography>Open Subject Classes</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item md={4} sm={12} xs={12}>
                    <Card variant="outlined">
                        <CardContent>
                            <Grading fontSize="large" />
                            <Typography>Closed Subject Classes</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>}

            {includes(roles, 'Evaluation Manager') && <TextField
                defaultValue={filters?.search || ''}
                inputRef={targetRefQuickSearch}
                fullWidth
                label="Quick Search"
                onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                        router.get(`/evaluation-schedules/${id}/evaluatees`, { search: targetRefQuickSearch.current.value }, { preserveScroll: true });    
                    }
                }}
                variant="outlined"
                sx={{ mb: 4 }}
            />}

            {evaluateesPaginationMeta.last_page > 1 && <Pagination
                count={evaluateesPaginationMeta.last_page}
                onChange={handleEvaluateesPageChange}
                page={evaluateesPaginationMeta.current_page}
                sx={{ textAlign: "center", mb: 4}}/>}
            
            {evaluatees.data.map((evaluatee) => <Accordion key={evaluatee.id}>
                <AccordionSummary
                    expandIcon={<ArrowDownward />}
                >
                    <PersonPin />
                    <Typography flex={1}>
                        {evaluatee.last_name}, {evaluatee.first_name} ({evaluatee.email})
                    </Typography>
                    <Badge badgeContent={evaluatee.subject_classes_count_open} color="primary" sx={{ mr: 2 }}>
                        <Subject />
                    </Badge>
                    <Typography>{`(${evaluatee.subject_classes_count_closed} of ${evaluatee.subject_classes_count})`}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {/* Evaluation Result Summary */}
                    {evaluatee.subject_classes_count_closed > 0 && <Button sx={{ mb: 2 }}>
                        <Button onClick={() => handleEvaluationResultSummary(evaluatee)} variant="contained">
                            {`${evaluationScheduleIsOpen ? 'Tentative ' : ''}Overall Evaluation Result Summary`}
                        </Button>
                    </Button>}

                    <Box>
                        <DataGrid
                            columns={[
                                {
                                    field: 'evaluation_code',
                                    headerName: 'Evaluation Code',
                                    width: 150,
                                    valueGetter: (cell) => cell.row.evaluation?.code,
                                },
                                {
                                    field: 'section',
                                    headerName: 'Section',
                                    width: 100,
                                },
                                {
                                    field: 'subject',
                                    headerName: 'Subject',
                                    width: 200,
                                    valueGetter: (cell) => `${cell.row.subject.code} - ${cell.row.subject.title}`,
                                },
                                {
                                    field: 'course_and_year_level',
                                    headerName: 'Course/Yr.',
                                    width: 150,
                                    valueGetter: (cell) => `${cell.row.course.code} - ${cell.row.year_level}`,
                                },
                                {
                                    field: 'schedule',
                                    headerName: 'Schedule',
                                    width: 250,
                                },
                                {
                                    field: 'evaluation_repondents',
                                    headerName: 'Respondents',
                                    width: 150,
                                    renderCell: (cell) => {
                                        const { evaluation } = cell.row;
                                        const { evaluators_count: evaluatorsCount, evaluators_count_submitted: evaluatorsCountSubmitted } = evaluation || {};
                                        return evaluatorsCount > 0 ? <Gauge
                                            height={90}
                                            value={evaluatorsCountSubmitted}
                                            valueMax={evaluatorsCount}
                                            text={({ value, valueMax }) => `${value} / ${valueMax}`}
                                        /> : null;
                                    },
                                },
                                {
                                    'field': 'evaluation_overall_rating',
                                    'headerName': 'Overall Rating',
                                    'width': 300,
                                    renderCell: (cell) => {
                                        const { evaluation } = cell.row;

                                        if (evaluation && evaluation.is_open) {
                                            return <HourglassTop />;
                                        }

                                        const { result } = evaluation || {};
                                        const { details } = result || {};
                                        const overallRating = details?.overall_rating || 0;
                                        const descriptiveEquivalent = details?.descriptive_equivalent || '';
                                        const percentileEquivalent = details?.percentile_equivalent || '';
                                        return <Box>
                                            {overallRating.toFixed(2)} ({percentileEquivalent}%) ({descriptiveEquivalent})<br/>
                                            <Rating precision={0.1} value={overallRating} size="small" readOnly />
                                        </Box>;
                                    },
                                },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    width: 100,
                                    getActions: (params) => {
                                        const { row } = params;
                                        const { evaluation } = row;

                                        let actions = [];

                                        if (evaluation) {
                                            if (includes(roles, 'Evaluation Manager') && evaluation.is_open) {
                                                actions.push(<GridActionsCellItem
                                                    icon={<Calculate />}
                                                    label="Calculate Result"
                                                    onClick={() => handleCalculateResult(params)}
                                                    showInMenu
                                                />);
                                            } 
                                            
                                            if (!evaluation.is_open) {
                                                actions.push(<GridActionsCellItem
                                                    icon={<ViewAgenda />}
                                                    label="View Result"
                                                    onClick={() => handleEvaluationResultPerClassDetails(row.id)}
                                                    showInMenu
                                                />);
                                            }
                                        }

                                        actions.push(<GridActionsCellItem
                                            icon={<People />}
                                            label="Class Roster"
                                            onClick={() => handleEvaluationClassRoster(row.id)}
                                            showInMenu
                                        />);

                                        return actions;
                                    },
                                }
                            ]}
                            rows={evaluatee.subject_classes}
                            slots={{ toolbar: GridToolbar }}
                            slotProps={{
                                toolbar: {
                                    showQuickFilter: true,
                                }
                            }}
                            density="compact"
                            disableColumnFilter
                            disableColumnSelector
                            disableDensitySelector
                            disableRowSelectionOnClick
                            getRowHeight={() => 'auto'}
                            hideFooter
                        />
                    </Box>
                </AccordionDetails>
            </Accordion>)}

            {evaluateeEvaluationClassRoster && evaluationClassRoster(evaluateeEvaluationClassRoster, evaluateeSubjectClassId)}

            {evaluateeEvaluationResultPerClass && evaluateeSubjectClassId && evaluationResultPerClassDetails(evaluateeEvaluationResultPerClass, evaluateeSubjectClassId)}

            {evaluateeEvaluationResultSummary && evaluationResultSummaryDetails(evaluateeEvaluationResultSummary)}
        </>
    );
};

List.layout = page => <MainLayout children={page} title="Evaluation Schedule" />;

export default List;