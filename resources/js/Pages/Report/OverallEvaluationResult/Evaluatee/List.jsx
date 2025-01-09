import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import MainLayout from "../../../../MainLayout";
import { Link, Typography } from "@mui/material";
import { Event, FolderOpen, HourglassBottomTwoTone } from "@mui/icons-material";
import React from 'react';
import { router, usePage } from "@inertiajs/react";
import { PieChart } from "@mui/x-charts";

const List = ({ academic_year: academicYear, semester_id: semesterId, evaluatees }) => {
    const { auth } = usePage().props;
    const { roles } = auth;

    console.log(usePage().props);

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
        router.get(`/reports/overall-evaluation-results/${academicYear}/${semesterId}/evaluatees`, {
            page: newPaginationModel.page + 1,
            per_page: newPaginationModel.pageSize,
        }, {
            preserveScroll: true,
            onSuccess: () => setPaginationModel(newPaginationModel),
        });
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
            field: 'student-to-teacher-evaluation',
            headerName: 'Student to Teacher Evaluation',
            flex: 0.15,
            renderCell: (cell) => {
                const { field, row } = cell;
                const { evaluation_results } = row;
                const evaluationResult = evaluation_results.find(evaluationResult => evaluationResult.evaluation_type.code === field);
                return  evaluationResult?.weighted_rating?.toFixed(2) ?? <HourglassBottomTwoTone />;
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
                return  evaluationResult?.weighted_rating?.toFixed(2) ?? <HourglassBottomTwoTone />;
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
                return  evaluationResult?.weighted_rating?.toFixed(2) ?? <HourglassBottomTwoTone />;
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
                return  evaluationResult?.weighted_rating?.toFixed(2) ?? <HourglassBottomTwoTone />;
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
                {semesterId} {academicYear} Overall Evaluation Results
            </Typography>
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