import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import MainLayout from "../../../../MainLayout";
import { FormControl, InputLabel, Link, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import { Event, FolderOpen, HourglassBottomTwoTone } from "@mui/icons-material";
import React from 'react';
import { router, usePage } from "@inertiajs/react";
import { PieChart } from "@mui/x-charts";
import { includes } from "lodash";

const List = ({ academic_year: academicYear, semester_id: semesterId, semester, filters, departments, evaluatees }) => {
    const { auth } = usePage().props;
    const { roles } = auth;

    const targetRefQuickSearch = React.useRef();
    const targetRefFiltersDepartment = React.useRef();

    const [paginationModel, setPaginationModel] = React.useState({
        page: evaluatees.meta.current_page - 1,
        pageSize: evaluatees.meta.per_page,
    });

    const rowCountRef = React.useRef(evaluatees?.meta?.total || 0);

    const rowCount = React.useMemo(() => {
        if (evaluatees?.meta?.total !== undefined) {
            rowCountRef.current = evaluatees.meta.total;
        }
        return rowCountRef.current;
    }, [evaluatees?.meta?.total]);

    const handlePaginationChange = (newPaginationModel) => {
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('page', newPaginationModel.page + 1);
        queryParams.set('per_page', newPaginationModel.pageSize);

        router.get(
            `/reports/overall-evaluation-results/${academicYear}/${semesterId}/evaluatees?${queryParams.toString()}`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => setPaginationModel(newPaginationModel),
            }
        );
    };

    const commonColumns = [
        {
            field: 'institution_id',
            flex: 0.15,
            headerName: 'ID',
        },
        {
            field: 'last_name',
            flex: 0.2,
            headerName: 'Last Name',
        },
        {
            field: 'first_name',
            flex: 0.2,
            headerName: 'First Name',
        },
        {
            field: 'department',
            headerName: 'Department',
            flex: 0.2,
            renderCell: (cell) => {
                const { value: department } = cell;
                return department?.code;
            },
        },
        {
            field: 'student-to-teacher-evaluation',
            headerName: 'Student to Teacher Evaluation',
            flex: 0.15,
            renderCell: (cell) => {
                const { field, row } = cell;
                const { evaluation_results } = row;
                const evaluationResult = evaluation_results.find(evaluationResult => evaluationResult.evaluation_type.code === field);
                return evaluationResult?.weighted_rating?.toFixed(2) ?? <HourglassBottomTwoTone />;
            },
        },
        {
            field: 'peer-evaluation',
            headerName: 'Peer Evaluation',
            flex: 0.15,
            renderCell: (cell) => {
                const { field, row } = cell;
                const { evaluation_results } = row;
                const evaluationResult = evaluation_results.find(evaluationResult => evaluationResult.evaluation_type.code === field);
                return evaluationResult?.weighted_rating?.toFixed(2) ?? <HourglassBottomTwoTone />;
            },
        },
        {
            field: 'dean-to-teacher-evaluation',
            headerName: 'Dean to Teacher Evaluation',
            flex: 0.15,
            renderCell: (cell) => {
                const { field, row } = cell;
                const { evaluation_results } = row;
                const evaluationResult = evaluation_results.find(evaluationResult => evaluationResult.evaluation_type.code === field);
                return evaluationResult?.weighted_rating?.toFixed(2) ?? <HourglassBottomTwoTone />;
            },
        },
        {
            field: 'self-evaluation',
            headerName: 'Self Evaluation',
            flex: 0.15,
            renderCell: (cell) => {
                const { field, row } = cell;
                const { evaluation_results } = row;
                const evaluationResult = evaluation_results.find(evaluationResult => evaluationResult.evaluation_type.code === field);
                return evaluationResult?.weighted_rating?.toFixed(2) ?? <HourglassBottomTwoTone />;
            },
        },
        {
            field: 'overall_weighted_rating',
            headerName: 'Overall Rating',
            flex: 0.15,
            renderCell: (cell) => {
                const { value } = cell;

                return value ? value.toFixed(2) : <HourglassBottomTwoTone />;
            },
        },
    ];

    let otherColumns = [];

    const actions = [
        {
            field: 'actions',
            type: 'actions',
            width: 100,
            getActions: (params) => {
                const { row } = params;

                let actions = [];

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
                {semester} {academicYear} Overall Evaluation Results
            </Typography>

            {includes(roles, 'Evaluation Manager') && <Paper variant="outlined" sx={{ mb: 4, p: 2 }}>
                <TextField
                    defaultValue={filters?.search || ''}
                    inputRef={targetRefQuickSearch}
                    fullWidth
                    label="Quick Search"
                    onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                            const queryParams = new URLSearchParams(window.location.search);
                            queryParams.delete('page');
                            queryParams.set('search', targetRefQuickSearch.current.value);
                            router.get(
                                `/reports/overall-evaluation-results/${academicYear}/${semesterId}/evaluatees?${queryParams.toString()}`,
                                {},
                                { preserveScroll: true }
                            );
                        }
                    }}
                    variant="outlined"
                    sx={{ mb: 4 }}
                />
                <FormControl fullWidth>
                    <InputLabel id="demo-select-small-label">Department</InputLabel>
                    <Select
                        labelId="demo-select-small-label"
                        id="demo-select-small"
                        defaultValue={filters?.department || 0}
                        inputRef={targetRefFiltersDepartment}
                        label="Department"
                        onChange={(_event, item) => {
                            const { props } = item;
                            const { value } = props;
                            const queryParams = new URLSearchParams(window.location.search);
                            queryParams.delete('page');
                            queryParams.set('department', value);
                            router.get(
                                `/reports/overall-evaluation-results/${academicYear}/${semesterId}/evaluatees?${queryParams.toString()}`,
                                {},
                                { preserveScroll: true }
                            );
                        }}
                    >
                        <MenuItem value={0}><em>All</em></MenuItem>
                        {departments.data.map((department) => <MenuItem value={department.id}>({department.code}) {department.title}</MenuItem>)}
                    </Select>
                </FormControl>
            </Paper>}

            <DataGrid
                columns={columns}
                density="compact"
                filterMode="server"
                onPaginationModelChange={handlePaginationChange}
                pageSizeOptions={[5, 10, 15]}
                paginationMode="server"
                paginationModel={paginationModel}
                rowCount={rowCount}
                rows={evaluatees.data}
            />
        </>
    );
};

List.layout = page => <MainLayout children={page} title={"Overall Evaluation Results"} />;

export default List;