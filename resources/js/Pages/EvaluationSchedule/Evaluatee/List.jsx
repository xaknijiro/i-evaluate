import { Accordion, AccordionDetails, AccordionSummary, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link, Paper, Stack, styled, TextField, Typography } from "@mui/material";
import { ArrowDownward, Calculate, CloudUpload, People, PersonPin, Subject } from "@mui/icons-material";
import React from 'react';
import { router, useForm } from "@inertiajs/react";
import MainLayout from "../../../MainLayout";
import { DataGrid, GridActionsCellItem, GridToolbar } from "@mui/x-data-grid";
import { Gauge } from "@mui/x-charts";

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
    const { id, academic_year: academicYear, semester } = evaluationSchedule.data;
    const [openClassRoster, setOpenClassRoster] = React.useState(null);
    
    const { 
        data: classRosterData,
        setData: setClassRosterData,
        post: postClassRoster,
        errors: classRosterErrors,
        reset: resetClassRosterForm,
    } = useForm({
        class_roster: null,
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

    const handleOpenClassRoster = (params) => {
        setOpenClassRoster(params);
    };

    const handleCloseClassRoster = () => {
        resetClassRosterForm();
        setOpenClassRoster(null);
    };

    return (
        <>
            <Paper sx={{ padding: 2, backgroundColor: "burlywood" }}>
                <Typography>Semester/A.Y.</Typography>
                <Typography>{semester}/{academicYear}</Typography>
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

            {evaluatees.data.map((evaluatee) => <Accordion>
                <AccordionSummary
                    expandIcon={<ArrowDownward />}
                >
                    <PersonPin />
                    <Typography flex={1}>{evaluatee.last_name}, {evaluatee.first_name}</Typography>
                    <Badge badgeContent={evaluatee.subject_classes_count} color="primary">
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
                                    valueGetter: (cell) => cell.row.evaluation.code,
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
                                    field: 'course',
                                    headerName: 'Course',
                                    width: 150,
                                    valueGetter: (cell) => `${cell.row.course.code} - ${cell.row.course.title}`,
                                },
                                {
                                    field: 'year_level',
                                    headerName: 'Year Level',
                                    width: 75,
                                },
                                {
                                    field: 'schedule',
                                    headerName: 'Schedule',
                                    width: 250,
                                },
                                {
                                    field: 'evaluation_status',
                                    headerName: 'Evaluation Status',
                                    width: 150,
                                    renderCell: (cell) => {
                                        const { evaluation } = cell.row;
                                        const { evaluators_count: evaluatorsCount, evaluators_count_submitted: evaluatorsCountSubmitted } = evaluation;
                                        return <Gauge
                                            height={100}
                                            value={evaluatorsCountSubmitted}
                                            valueMax={evaluatorsCount}
                                            text={({value, valueMax}) => `${value} / ${valueMax}`}
                                        />;
                                    },
                                },
                                {
                                    field: 'actions',
                                    type: 'actions',
                                    width: 100,
                                    getActions: (params) => [
                                        <GridActionsCellItem
                                            icon={<Calculate />}
                                            label="Calculate Result"
                                        />,
                                        <GridActionsCellItem
                                            icon={<People />}
                                            label="Class Roster"
                                            onClick={() => handleOpenClassRoster(params)}
                                            showInMenu
                                        />,
                                    ],
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
                fullWidth
            >
                <DialogTitle>Class Roster</DialogTitle>
                <DialogContent>
                    <DialogContentText>Enter student ID separated by line break.</DialogContentText>
                    <TextField
                        error={!!classRosterErrors.class_roster}
                        helperText={classRosterErrors?.class_roster}
                        margin="dense"
                        maxRows={30}
                        minRows={10}
                        name="class_roster"
                        onChange={(e) => setClassRosterData('class_roster', e.target.value)}
                        value={classRosterData.class_roster}
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
        </>
    );
};

List.layout = page => <MainLayout children={page} title="Evaluation Forms" />;

export default List;