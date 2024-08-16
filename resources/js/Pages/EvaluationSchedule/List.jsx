import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MainLayout from "../../MainLayout";
import { Button, FormControl, Grid, IconButton, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { Delete, FolderOpen, Lock, LockOpen } from "@mui/icons-material";
import React from 'react';
import { Link, router, useForm } from "@inertiajs/react";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const List = ({ evaluationSchedules, evaluationTypes, evaluationForms, semesters }) => {
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
        page: evaluationSchedules.current_page - 1,
        pageSize: evaluationSchedules.per_page,
    });

    const rowCountRef = React.useRef(evaluationSchedules?.total || 0);

    const rowCount = React.useMemo(() => {
        if (evaluationSchedules?.total !== undefined) {
            rowCountRef.current = evaluationSchedules.total;
        }
        return rowCountRef.current;
    }, [evaluationSchedules?.total]);

    const handleCreateEvaluationSchedule = (event) => {
        event.preventDefault();
        post('/evaluation-schedules', {
            preserveScroll: true,
            onSuccess: (event) => {
                console.log(event);
                reset();
                setAcademicYearEnd(null);
            },
        });
    };

    const handleDeleteEvaluationSchedule = (id, event) => {
        event.preventDefault();
        router.delete(`/evaluation-schedules/${id}`, {
            preserveScroll: true,
        });
    };

    const handleFilterChange = (newFilterModel) => {
        console.log(newFilterModel);
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

    const columns = [
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
            valueGetter: (row) => {
                return row.value.title;
            },
        },
        {
            field: 'evaluation_type',
            headerName: 'Evaluation Type',
            flex: 1,
            valueGetter: (row) => {
                return row.value.title;
            },
        },
        {
            field: 'evaluation_form',
            headerName: 'Evaluation Form',
            flex: 1,
            valueGetter: (row) => {
                return `${row.value.id} - ${row.value.title}`;
            },
        },
        {
            field: 'subject_classes_count',
            headerName: 'Subject Classes',
            flex: 1,
            renderCell: (cell) => `${cell.value} (Open: ${cell.row.subject_classes_count_open} | Closed: ${cell.row.subject_classes_count_closed})`,
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
        {
            headerName: '',
            renderCell: (cell) => <>
                <Link
                    href={`/evaluation-schedules/${cell.row.id}/evaluatees`}
                >
                    <FolderOpen/>
                </Link>
                <IconButton onClick={(event) => handleDeleteEvaluationSchedule(cell.row.id, event)}>
                    <Delete/>
                </IconButton>
            </>,
        },
    ];

    return (
        <>
            <Paper
                component="form"
                onSubmit={handleCreateEvaluationSchedule}
                sx={{ mb: 2, p: 2, width: "50%" }}
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
            </Paper>
            <DataGrid
                columns={columns}
                filterMode="server"
                onFilterModelChange={handleFilterChange}
                onPaginationModelChange={handlePaginationChange}
                pageSizeOptions={[5, 10, 15]}
                paginationMode="server"
                paginationModel={paginationModel}
                rowCount={rowCount}
                rows={evaluationSchedules.data}
                slots={{ toolbar: GridToolbar }}
            />
        </>
    );
};

List.layout = page => <MainLayout children={page} title="Evaluation Forms" />;

export default List;