import { DataGrid, GridToolbarContainer, GridToolbarExport } from "@mui/x-data-grid";
import MainLayout from "../../../../MainLayout";
import { Box, Button, Divider, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import { Event, HourglassBottomTwoTone, PictureAsPdf } from "@mui/icons-material";
import React, { useRef } from 'react';
import { router, usePage } from "@inertiajs/react";
import { includes } from "lodash";
import generatePDF, { Margin } from "react-to-pdf";

const CustomToolbar = (semester, academicYear, department, targetRefOverallEvaluationResultToPdf) => <GridToolbarContainer>
    <GridToolbarExport
        csvOptions={{
            fileName: `${semester} ${academicYear} Overall Evaluation Results ${department ? department.code : 'All Departments'}`.replaceAll(' ', '_').toLowerCase(),
        }}
        printOptions={{
            disableToolbarButton: true
        }}
    />
    <Button
        startIcon={<PictureAsPdf />}
        onClick={async () => {
            document.getElementsByClassName('MuiDataGrid-toolbarContainer')[0].remove();
            await generatePDF(targetRefOverallEvaluationResultToPdf, {
                filename:  `${semester} ${academicYear} Overall Evaluation Results ${department ? department.code : 'All Departments'}`.replaceAll(' ', '_').toLowerCase() + '.pdf',
                page: {
                    margin: Margin.SMALL,
                    orientation: 'landscape',
                }
            });
            window.location.reload();
        }}
    >
        PDF
    </Button>
</GridToolbarContainer>;

const List = ({ academic_year: academicYear, semester_id: semesterId, semester, filters, departments, evaluatees, reportHeader }) => {
    const { auth } = usePage().props;
    const { roles } = auth;

    const targetRefOverallEvaluationResultToPdf = useRef();

    const targetRefQuickSearch = React.useRef();

    const [selectedDepartment, setSelectedDepartment] = React.useState(filters.department
        ? departments.data.find(department => department.id == filters.department) : 0);

    const [paginationModel, setPaginationModel] = React.useState({
        page: evaluatees?.meta ? evaluatees.meta.current_page - 1 : 0,
        pageSize: evaluatees?.meta?.per_page || -1,
    });

    const rowCountRef = React.useRef(evaluatees?.meta?.total || evaluatees.data.length || 0);

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
            valueGetter: (department) => {
                return department?.code;
            }
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
            valueGetter: (_cell, row, definitions) => {
                const { field } = definitions;
                const { evaluation_results } = row;
                const evaluationResult = evaluation_results.find(evaluationResult => evaluationResult.evaluation_type.code === field);
                return evaluationResult?.weighted_rating?.toFixed(2) ?? '';
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
            valueGetter: (_cell, row, definitions) => {
                const { field } = definitions;
                const { evaluation_results } = row;
                const evaluationResult = evaluation_results.find(evaluationResult => evaluationResult.evaluation_type.code === field);
                return evaluationResult?.weighted_rating?.toFixed(2) ?? '';
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
            valueGetter: (_cell, row, definitions) => {
                const { field } = definitions;
                const { evaluation_results } = row;
                const evaluationResult = evaluation_results.find(evaluationResult => evaluationResult.evaluation_type.code === field);
                return evaluationResult?.weighted_rating?.toFixed(2) ?? '';
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
            valueGetter: (_cell, row, definitions) => {
                const { field } = definitions;
                const { evaluation_results } = row;
                const evaluationResult = evaluation_results.find(evaluationResult => evaluationResult.evaluation_type.code === field);
                return evaluationResult?.weighted_rating?.toFixed(2) ?? '';
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
                        defaultValue={selectedDepartment ? selectedDepartment.id : 0}
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
                                {
                                    onSuccess: () => setSelectedDepartment(departments.data.find(department => department.id === value) ?? null),
                                    preserveScroll: true
                                }
                            );
                        }}
                    >
                        <MenuItem value={0}><em>All</em></MenuItem>
                        {departments.data.map((department) => <MenuItem key={department.id} value={department.id}>({department.code}) {department.title}</MenuItem>)}
                    </Select>
                </FormControl>
            </Paper>}

            <div ref={targetRefOverallEvaluationResultToPdf}>
                <Box marginBottom={2} textAlign="center">
                    <img src={reportHeader} width="50%" />
                    <Divider sx={{ my: 2 }} />
                    <Typography>
                        {semester} A.Y. {academicYear} Overall Evaluation Results | {selectedDepartment ? `(${selectedDepartment.code}) ${selectedDepartment.title}` : 'All Departments'}
                    </Typography>
                </Box>

                <DataGrid
                    columns={columns}
                    density="compact"
                    filterMode="server"
                    onPaginationModelChange={handlePaginationChange}
                    pageSizeOptions={[5, 10, 15, { label: 'All', value: -1 }]}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    rowCount={rowCount}
                    rows={evaluatees.data}
                    slots={{ toolbar: () => CustomToolbar(
                        semester,
                        academicYear,
                        selectedDepartment,
                        targetRefOverallEvaluationResultToPdf
                    ) }}
                    disableColumnMenu
                />
            </div>

        </>
    );
};

List.layout = page => <MainLayout children={page} title={"Overall Evaluation Results"} />;

export default List;