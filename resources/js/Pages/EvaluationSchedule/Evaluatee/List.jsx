import { Accordion, AccordionDetails, AccordionSummary, AppBar, Badge, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, IconButton, Link, Paper, Stack, styled, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, TextField, Toolbar, Typography, useTheme } from "@mui/material";
import { Apartment, ArrowDownward, Build, Calculate, CalendarMonth, CardMembership, Check, CheckBox, CheckBoxOutlineBlank, Close, CloudUpload, DepartureBoard, Email, Event, HourglassEmpty, HourglassTop, Password, People, PersonPin, PictureAsPdf, School, Subject, ViewAgenda, Warehouse } from "@mui/icons-material";
import React from 'react';
import { router, useForm } from "@inertiajs/react";
import MainLayout from "../../../MainLayout";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { BarChart, Gauge, gaugeClasses } from "@mui/x-charts";
import { find, findKey } from "lodash";
import { usePDF } from "react-to-pdf";

const BarChartCommonSettings = (theme) => ({
    colors: [theme.palette.info.main],
    height: 175,
    sx: {
        display: "inline-block",
    },
    width: 350,
});

const GaugeCommonSettings = {
    endAngle: 110,
    height: 100,
    innerRadius: "80%",
    startAngle: -110,
    width: 125,
    sx: (theme) => {
        console.log(theme);
        return ({
            display: "inline-block",
            [`& .${gaugeClasses.valueArc}`]: {
                fill: theme.palette.info.main,
            },
        });
    },
};

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
    const { id, academic_year: academicYear, semester, evaluation_type: evaluationType, evaluation_form: evaluationForm } = evaluationSchedule.data;
    const [openClassRoster, setOpenClassRoster] = React.useState(null);
    const [evaluateeEvaluationResult, setEvaluateeEvaluationResult] = React.useState(null);
    const [evaluationResultDetails, setEvaluationResultDetails] = React.useState(null);

    const {
        data: classRosterData,
        setData: setClassRosterData,
        post: postClassRoster,
        errors: classRosterErrors,
        reset: resetClassRosterForm,
    } = useForm({
        class_roster: null,
    });

    const { toPDF, targetRef } = usePDF({
        filename: 'test.pdf',
    });

    const handleImport = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        router.post(`/evaluation-schedules/${id}/evaluatees`, formJson, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    const handleCalculateResult = (params) => {
        const { row } = params;
        const { evaluation } = row;
        router.post(`/calculate-evaluation-result/${evaluation.id}`, {}, {
            preserveScroll: true,
        });
    };

    const handleOpenClassRoster = (params) => {
        setOpenClassRoster(params);
    };

    const handleCloseClassRoster = () => {
        resetClassRosterForm();
        setOpenClassRoster(null);
    };

    const handleEvaluationResultDetails = (params) => {
        const { row } = params;
        const { evaluation } = row;
        const { result } = evaluation;
        const evaluateeIndex = findKey(evaluatees.data, (evaluatee) => !!evaluatee.subject_classes.find((subjectClass) => subjectClass.id === result.evaluation_schedule_subject_class_id));
        const evaluatee = evaluatees.data[evaluateeIndex];
        if (evaluatee) {
            evaluatee['subject_class_open'] = find(evaluatee.subject_classes, { id: result.evaluation_schedule_subject_class_id });
        }
        setEvaluationResultDetails(result);
        setEvaluateeEvaluationResult(evaluatee);
    };

    const handleCloseEvaluationResultDetails = () => {
        setEvaluationResultDetails(null);
        setEvaluateeEvaluationResult(null);
    };

    return (
        <>
            <Paper sx={{ padding: 2, backgroundColor: "burlywood" }}>
                <Typography>Semester/A.Y.</Typography>
                <Typography>{semester}/{academicYear}</Typography>
                <Typography>{evaluationType.title}</Typography>
                <Link onClick={() => window.history.back()}>Back</Link>
            </Paper>

            <Paper sx={{ marginBottom: 2, padding: 2, width: '25%' }}>
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

            <Paper sx={{ marginBottom: 2, padding: 2 }}>

            </Paper>

            {evaluatees.data.map((evaluatee) => <Accordion key={evaluatee.id}>
                <AccordionSummary
                    expandIcon={<ArrowDownward />}
                >
                    <PersonPin />
                    <Typography flex={1}>
                        {evaluatee.last_name}, {evaluatee.first_name} ({evaluatee.email})
                    </Typography>
                    <Badge badgeContent={evaluatee.subject_classes_count_open} color="primary">
                        <Subject />
                    </Badge>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ height: 300 }}>
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
                                            height={100}
                                            value={evaluatorsCountSubmitted}
                                            valueMax={evaluatorsCount}
                                            text={({ value, valueMax }) => `${value} / ${valueMax}`}
                                        /> : null;
                                    },
                                },
                                {
                                    'field': 'evaluation_overall_score',
                                    'headerName': 'Overall Score',
                                    'width': 150,
                                    renderCell: (cell) => {
                                        const { evaluation } = cell.row;

                                        if (evaluation && evaluation.is_open) {
                                            return <HourglassTop />;
                                        }

                                        const { result } = evaluation || {};
                                        const { details } = result || {};
                                        return <Gauge
                                            height={100}
                                            value={details?.overall_score || 0}
                                            valueMax={100}
                                            text={({ value }) => `${value}%`} />;
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
                                            if (evaluation.is_open) {
                                                actions.push(<GridActionsCellItem
                                                    icon={<Calculate />}
                                                    label="Calculate Result"
                                                    onClick={() => handleCalculateResult(params)}
                                                    showInMenu
                                                />);
                                            } else {
                                                actions.push(<GridActionsCellItem
                                                    icon={<ViewAgenda />}
                                                    label="View Result"
                                                    onClick={() => handleEvaluationResultDetails(params)}
                                                    showInMenu
                                                />);
                                            }
                                        }

                                        actions.push(<GridActionsCellItem
                                            icon={<People />}
                                            label="Class Roster"
                                            onClick={() => handleOpenClassRoster(params)}
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

            <Dialog
                maxWidth="lg"
                open={!!openClassRoster}
                onClose={handleCloseClassRoster}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        postClassRoster(`/evaluation-schedules/${id}/subject-classes/${openClassRoster.id}/class-rosters`, {
                            onSuccess: () => {
                                resetClassRosterForm();
                                handleCloseClassRoster();
                            }
                        });
                    },
                }}
                fullScreen
            >
                <DialogTitle>Class Roster</DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student ID</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Responded</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {openClassRoster && openClassRoster.row.evaluation?.evaluators.map((evaluator) => <TableRow
                                    key={evaluator.id}
                                >
                                    <TableCell>{evaluator.institution_id}</TableCell>
                                    <TableCell>{evaluator.email}</TableCell>
                                    <TableCell>{!!evaluator.submitted ? <Check htmlColor="green" /> : null}</TableCell>
                                </TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <DialogContentText>Enter student ID separated by line break.</DialogContentText>
                    <TextField
                        error={!!classRosterErrors.class_roster}
                        helperText={classRosterErrors?.class_roster}
                        margin="dense"
                        maxRows={30}
                        minRows={10}
                        name="class_roster"
                        onChange={(e) => setClassRosterData('class_roster', e.target.value)}
                        value={classRosterData.class_roster || ''}
                        autoFocus
                        fullWidth
                        multiline
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseClassRoster}>Cancel</Button>
                    <Button type="submit">Submit</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={!!evaluateeEvaluationResult && !!evaluationResultDetails}
                onClose={handleCloseEvaluationResultDetails}
                fullScreen
            >
                <AppBar sx={{ position: 'fixed' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleCloseEvaluationResultDetails}
                            aria-label="close"
                        >
                            <Close />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Class Evaluation Result
                        </Typography>
                        <IconButton onClick={() => toPDF()}>
                            <PictureAsPdf />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Container sx={{ mt: 12, mb: 4 }}>
                    <div ref={targetRef}>
                        <Paper sx={{ mb: 2, p: 2 }}>
                            <Typography
                                variant="h4"
                                textAlign="center"
                                gutterBottom
                            >
                                {evaluationType.title} Result
                            </Typography>

                            <Paper sx={{ mb: 2, p: 2 }}>
                                <Stack direction="row" spacing={1} alignItems="center" marginBottom={2}>
                                    <PersonPin />
                                    <Typography variant="h5" display="inline">
                                        {evaluateeEvaluationResult?.last_name}, {evaluateeEvaluationResult?.first_name}
                                    </Typography>
                                    <Chip color="primary" icon={<CardMembership />} label={evaluateeEvaluationResult?.institution_id} sx={{ mr: 1 }} />
                                    <Chip color="secondary" icon={<Email />} label={evaluateeEvaluationResult?.email} sx={{ mr: 1 }} />
                                    <Chip color="secondary" icon={<Apartment />} label={evaluateeEvaluationResult?.department.title} sx={{ mr: 1 }} />
                                </Stack>
                                <Chip icon={<Password />} label={evaluateeEvaluationResult?.subject_class_open.evaluation.code} sx={{ mr: 1 }} />
                                <Chip icon={<Subject />} label={`${evaluateeEvaluationResult?.subject_class_open.subject.code} - 
                                ${evaluateeEvaluationResult?.subject_class_open.subject.title} (${evaluateeEvaluationResult?.subject_class_open.section})`} sx={{ mr: 1 }} />
                                <Chip icon={<School />} label={`${evaluateeEvaluationResult?.subject_class_open.course.code} ${evaluateeEvaluationResult?.subject_class_open.year_level}`} sx={{ mr: 1 }} />
                                <Chip icon={<Event />} label={evaluateeEvaluationResult?.subject_class_open.schedule} sx={{ mr: 1 }} />
                                <Chip icon={<CalendarMonth />} label={`A.Y. ${evaluateeEvaluationResult?.subject_class_open.academic_year} ${evaluateeEvaluationResult?.subject_class_open.semester}`} sx={{ mr: 1 }} />
                            </Paper>

                            <Typography
                                variant="h5"
                                textAlign="center"
                                gutterBottom
                            >
                                Evaluation Result Summary
                            </Typography>
                            <TableContainer component={Paper} sx={{ mb: 2 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Criterion</TableCell>
                                            <TableCell align="center">Total Score</TableCell>
                                            <TableCell align="center">Percentage</TableCell>
                                            <TableCell align="center">Weight</TableCell>
                                            <TableCell align="center">Weighted Score</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {evaluationForm.criteria.map((criterion) => {
                                            const { details } = evaluationResultDetails || {};
                                            const { criteria } = details || [];
                                            const criterionResult = find(criteria, { id: criterion.id });

                                            return <TableRow key={criterion.id}>
                                                <TableCell width="60%">{criterion.description}</TableCell>
                                                <TableCell align="center">
                                                    <Gauge
                                                        {...GaugeCommonSettings}
                                                        value={criterionResult?.total_score || 0}
                                                        valueMax={criterionResult?.total_max_score || 0}
                                                        text={({ value, valueMax }) => `${value.toFixed(2)} / ${valueMax.toFixed(2)}`}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Gauge
                                                        {...GaugeCommonSettings}
                                                        value={criterionResult?.percentage || 0}
                                                        text={({ value }) => `${value.toFixed(2)}%`}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={`${criterion.weight * 100}%`} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Gauge
                                                        {...GaugeCommonSettings}
                                                        value={criterionResult?.weighted_score || 0}
                                                        valueMax={100 * criterion.weight}
                                                        text={({ value }) => `${value.toFixed(2)}`}
                                                    />
                                                </TableCell>
                                            </TableRow>;
                                        })}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TableCell align="right" colSpan={4}>
                                                <Typography variant="h6">Overall Score</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Gauge
                                                    {...GaugeCommonSettings}
                                                    value={evaluationResultDetails?.details?.overall_score || 0}
                                                    valueMax={100}
                                                    text={({ value }) => `${value.toFixed(2)}`}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>

                            <Typography
                                variant="h5"
                                textAlign="center"
                                gutterBottom
                            >
                                Evaluation Responses Details
                            </Typography>
                            {evaluationForm.criteria.map((criterion) => {
                                const { details } = evaluationResultDetails || {};
                                const { criteria } = details || [];
                                const criterionResult = find(criteria, { id: criterion.id });

                                return <Accordion expanded key={criterion.id}>
                                    <AccordionSummary>
                                        <Typography flex={1} variant="h5">{criterion.description}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell width="75%">Indicator</TableCell>
                                                        <TableCell align="center">Responses</TableCell>
                                                        <TableCell align="center">Average Score</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {criterion.indicators.map((indicator, index) => {
                                                        const { indicators: indicatorsResult } = criterionResult || {};
                                                        const indicatorResult = find(indicatorsResult, { id: indicator.id });
                                                        const { ave_score: aveScore, tally } = indicatorResult || {};
                                                        const data = [0, 0, 0, 0, 0];

                                                        if (tally) {
                                                            tally.forEach(({ value, count }) => {
                                                                data[value - 1] = count;
                                                            });
                                                        }

                                                        return <TableRow key={indicator.id}>
                                                            <TableCell>
                                                                <Typography>{index + 1}. {indicator.description}</Typography>
                                                            </TableCell>
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
                                                            <TableCell align="center">
                                                                <Gauge
                                                                    {...GaugeCommonSettings}
                                                                    value={aveScore || 0}
                                                                    valueMax={5}
                                                                    text={({ value, valueMax }) => `${value.toFixed(2)} / ${valueMax.toFixed(2)}`}
                                                                />
                                                            </TableCell>
                                                        </TableRow>;
                                                    })}
                                                </TableBody>
                                                <TableFooter>
                                                    <TableRow>
                                                        <TableCell align="right" colSpan={2}>
                                                            <Typography variant="h6">Total Score</Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Gauge
                                                                {...GaugeCommonSettings}
                                                                value={criterionResult?.total_score || 0}
                                                                valueMax={criterionResult?.total_max_score || 0}
                                                                text={({ value, valueMax }) => `${value.toFixed(2)} / ${valueMax.toFixed(2)}`}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell align="right" colSpan={2}>
                                                            <Typography variant="h6">Percentage</Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Gauge
                                                                {...GaugeCommonSettings}
                                                                value={criterionResult?.percentage || 0}
                                                                text={({ value }) => `${value.toFixed(2)}%`}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell align="right" colSpan={2}>
                                                            <Typography variant="h6">Weight</Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={`${criterion.weight * 100}%`} />
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow>
                                                        <TableCell align="right" colSpan={2}>
                                                            <Typography variant="h6">Weighted Score</Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Gauge
                                                                {...GaugeCommonSettings}
                                                                value={criterionResult?.weighted_score || 0}
                                                                valueMax={100 * criterion.weight}
                                                                text={({ value }) => `${value.toFixed(2)}`}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableFooter>
                                            </Table>
                                        </TableContainer>
                                    </AccordionDetails>
                                </Accordion>;
                            })}
                        </Paper>
                    </div>
                </Container>
            </Dialog>
        </>
    );
};

List.layout = page => <MainLayout children={page} title="Evaluation Forms" />;

export default List;