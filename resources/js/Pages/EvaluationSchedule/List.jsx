import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import MainLayout from "../../MainLayout";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Link, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { Event, FolderOpen, Lock, LockOpen } from "@mui/icons-material";
import React from 'react';
import { router, useForm, usePage } from "@inertiajs/react";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { includes } from "lodash";

const List = ({ evaluationSchedules, evaluationTypes, evaluationForms, semesters }) => {
    const { auth } = usePage().props;
    const { roles } = auth;

    const { data, setData, post, reset, errors } = useForm({
        'academic_year_start': null,
        'academic_year_end': null,
        'semester': null,
        'evaluation_type': null,
        'evaluation_form': null,
    });

    const [academicYearEnd, setAcademicYearEnd] = React.useState(data.academic_year_start
        ? dayjs(data.academic_year_start).add(1, 'year') : null);

    React.useEffect(() => {
        setData('academic_year_end', academicYearEnd ? dayjs(academicYearEnd) : null);
    }, [academicYearEnd]);

    const [paginationModel, setPaginationModel] = React.useState({
        page: evaluationSchedules.meta.current_page - 1,
        pageSize: evaluationSchedules.meta.per_page,
    });

    const rowCountRef = React.useRef(evaluationSchedules?.meta?.total || 0);

    const rowCount = React.useMemo(() => {
        if (evaluationSchedules?.meta?.total !== undefined) {
            rowCountRef.current = evaluationSchedules.meta.total;
        }
        return rowCountRef.current;
    }, [evaluationSchedules?.meta?.total]);

    const handleCreateEvaluationSchedule = (event) => {
        event.preventDefault();
        post('/evaluation-schedules', {
            preserveScroll: true,
            onSuccess: (event) => {
                reset();
                setAcademicYearEnd(null);
            },
        });
    };

    const handleCloseEvaluationSchedule = (evaluationSchedule) => {
        router.patch(`/evaluation-schedules/${evaluationSchedule.id}`, {
        }, {
            preserveScroll: true,
            onSuccess: () => console.log('for implementation...'),
        });
    };

    const handleDeleteEvaluationSchedule = (id, event) => {
        event.preventDefault();
        router.delete(`/evaluation-schedules/${id}`, {
            preserveScroll: true,
        });
    };

    const handleFilterChange = (newFilterModel) => {

    };

    const handlePaginationChange = (newPaginationModel) => {
        router.get('/evaluation-schedules', {
            page: newPaginationModel.page + 1,
            per_page: newPaginationModel.pageSize,
        }, {
            preserveScroll: true,
            onSuccess: () => setPaginationModel(newPaginationModel),
        });
    };

    const confirmDeleteEvaluationDialog = (evaluationSchedule) => {
        return <Dialog open={true}>
            <DialogTitle>Dave</DialogTitle>
            <DialogContent>

            </DialogContent>
            <DialogActions>

            </DialogActions>
        </Dialog>;
    };

    const commonColumns = [
        {
            field: 'id',
            flex: 0.25,
            headerName: 'ID',
        },
        {
            field: 'academic_year',
            flex: 0.5,
            headerName: 'Academic Year',
        },
        {
            field: 'semester',
            headerName: 'Semester',
            flex: 0.5,
        },
        {
            field: 'evaluation_type',
            headerName: 'Evaluation Type',
            flex: 1,
            valueGetter: (row) => {
                return row.value.title;
            },
        },
    ];

    let otherColumns = [];
    if (includes(roles, 'Evaluation Manager')) {
        otherColumns = [
            {
                field: 'evaluation_form',
                headerName: 'Evaluation Form',
                flex: 1,
                valueGetter: (row) => {
                    return `${row.value.id} - ${row.value.title}`;
                },
            },
            {
                headerName: 'Open/Closed',
                flex: 1,
                renderCell: (cell) => {
                    const evaluationTypeCode = cell.row.evaluation_type.code;

                    let count;
                    let openCount;
                    let closedCount;

                    if (evaluationTypeCode === 'student-to-teacher-evaluation') {
                        count = cell.row.subject_classes_count;
                        openCount = cell.row.subject_classes_open_count;
                        closedCount = cell.row.subject_classes_closed_count;
                    } else {
                        count = cell.row.evaluatees_count;
                        openCount = cell.row.evaluatees_open_count;
                        closedCount = cell.row.evaluatees_closed_count;
                    }

                    return `${count} (Open: ${openCount} | Closed: ${closedCount})`;
                },
            },
            {
                field: 'is_open',
                headerName: 'Status',
                flex: 1,
                renderCell: (cell) => {
                    return !!cell.value ? <IconButton>
                        <LockOpen />
                    </IconButton> : <IconButton>
                        <Lock />
                    </IconButton>;
                },
            },
        ];
    }

    const actions = [
        {
            field: 'actions',
            type: 'actions',
            width: 100,
            getActions: (params) => {
                const { row } = params;
                const { is_open: evaluationScheduleIsOpen } = row;

                let actions = [
                    <GridActionsCellItem
                        component={Link}
                        href={`/evaluation-schedules/${row.id}/evaluatees`}
                        icon={<FolderOpen />}
                        label="View Schedule"
                        showInMenu
                    />
                ];

                if (includes(roles, "Evaluation Manager") && !!evaluationScheduleIsOpen) {
                    // @todo for implementation...
                    // actions.push(<GridActionsCellItem
                    //     icon={<Lock />}
                    //     label="Close Schedule"
                    //     onClick={() => handleCloseEvaluationSchedule(row)}
                    //     showInMenu
                    // />);
                }

                return actions;
            },
        }
    ];

    const columns = [...commonColumns, ...otherColumns, ...actions];

    return (
        <>
            <Typography
                marginBottom={2}
                sx={{ alignItems: 'center', display: 'flex' }}
                variant="h4">
                <Event fontSize="inherit" sx={{ mr: 0.5 }} />
                Evaluation Schedules
            </Typography>

            {includes(roles, 'Evaluation Manager') && <Paper
                component="form"
                onSubmit={handleCreateEvaluationSchedule}
                sx={{ mb: 2, p: 2, width: "50%" }}
                variant="outlined"
            >
                <Grid container spacing={2} marginBottom={2}>
                    <Grid item md={6}>
                        <DatePicker
                            format="YYYY"
                            label="Academic Year Start"
                            name="academic_year_start"
                            value={data.academic_year_start}
                            onChange={(e) => {
                                setData('academic_year_start', e);
                                setAcademicYearEnd(e?.add(1, 'year'));
                            }}
                            slotProps={{
                                textField: {
                                    margin: 'dense',
                                    error: !!errors.academic_year_start,
                                    helperText: errors?.academic_year_start,
                                }
                            }}
                            sx={{ width: "100%" }}
                            views={["year"]}
                        />
                    </Grid>
                    <Grid item md={6}>
                        <DatePicker
                            format="YYYY"
                            label="Academic Year End"
                            name="academic_year_end"
                            value={academicYearEnd}
                            onChange={(e) => {
                                setData('academic_year_end', e);
                            }}
                            slotProps={{
                                textField: {
                                    margin: 'dense',
                                    error: !!errors.academic_year_end,
                                    helperText: errors?.academic_year_end,
                                }
                            }}
                            sx={{ width: "100%" }}
                            views={["year"]}
                            readOnly
                        />
                    </Grid>
                    <Grid item md={12}>
                        <TextField
                            error={!!errors.semester}
                            helperText={errors?.semester}
                            label="Semester"
                            margin="dense"
                            name="semester"
                            value={data.semester}
                            onChange={(e) => setData('semester', e.target.value)}
                            sx={{ width: "100%" }}
                            select
                        >
                            {semesters.data.map((semester) => <MenuItem value={semester.id}>
                                {semester.title}
                            </MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item md={12}>
                        <TextField
                            error={!!errors.evaluation_type}
                            helperText={errors?.evaluation_type}
                            label="Evaluation Type"
                            margin="dense"
                            name="evaluation_type"
                            value={data.evaluation_type}
                            onChange={(e) => setData('evaluation_type', e.target.value)}
                            fullWidth
                            select
                        >
                            {evaluationTypes.data.map((evaluationType) => <MenuItem value={evaluationType.id}>
                                {evaluationType.title}
                            </MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item md={12}>
                        <TextField
                            error={!!errors.evaluation_form}
                            helperText={errors?.evaluation_form}
                            label="Evaluation Form"
                            margin="dense"
                            name="evaluation_form"
                            value={data.evaluation_form}
                            onChange={(e) => setData('evaluation_form', e.target.value)}
                            fullWidth
                            select
                        >
                            {evaluationForms.data.map((evaluationForm) => <MenuItem value={evaluationForm.id}>
                                {evaluationForm.title}
                            </MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>
                <Button type="submit" fullWidth>Create</Button>
            </Paper>}
            <DataGrid
                columns={columns}
                density="compact"
                filterMode="server"
                onFilterModelChange={handleFilterChange}
                onPaginationModelChange={handlePaginationChange}
                pageSizeOptions={[5, 10, 15]}
                paginationMode="server"
                paginationModel={paginationModel}
                rowCount={rowCount}
                rows={evaluationSchedules.data}
            />
        </>
    );
};

List.layout = page => <MainLayout children={page} title={"Evaluation Schedules"} />;

export default List;