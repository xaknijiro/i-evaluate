import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import MainLayout from "../../../MainLayout";
import { Link, Typography } from "@mui/material";
import { Event, FolderOpen } from "@mui/icons-material";
import React from 'react';
import { router, usePage } from "@inertiajs/react";
import { PieChart } from "@mui/x-charts";

const List = ({ summativeReportList }) => {
    const { auth } = usePage().props;
    const { roles } = auth;

    const [paginationModel, setPaginationModel] = React.useState({
        page: summativeReportList.meta.current_page - 1,
        pageSize: summativeReportList.meta.per_page,
    });

    const rowCountRef = React.useRef(summativeReportList?.meta?.total || 0);

    const rowCount = React.useMemo(() => {
        if (summativeReportList?.meta?.total !== undefined) {
            rowCountRef.current = summativeReportList.meta.total;
        }
        return rowCountRef.current;
    }, [summativeReportList?.meta?.total]);

    const handlePaginationChange = (newPaginationModel) => {
        router.get('/reports/overall-evaluation-results', {
            page: newPaginationModel.page + 1,
            per_page: newPaginationModel.pageSize,
        }, {
            preserveScroll: true,
            onSuccess: () => setPaginationModel(newPaginationModel),
        });
    };

    const commonColumns = [
        {
            field: 'academic_year',
            flex: 0.1,
            headerName: 'Academic Year',
        },
        {
            field: 'semester',
            headerName: 'Semester',
            flex: 0.1,
        },
        {
            field: 'student-to-teacher-evaluation',
            headerName: 'Student to Teacher Evaluation',
            flex: 0.2,
            renderCell: (cell) => {
                const evaluationSchedule = cell.row.evaluation_schedules.find(evaluationSchedule => evaluationSchedule.evaluation_type.code === cell.field);
                if (evaluationSchedule) {
                    const evaluationTypeCode = evaluationSchedule.evaluation_type.code;

                    let count;
                    let openCount;
                    let closedCount;

                    if (evaluationTypeCode === 'student-to-teacher-evaluation') {
                        count = evaluationSchedule.subject_classes_count;
                        openCount = evaluationSchedule.subject_classes_open_count;
                        closedCount = evaluationSchedule.subject_classes_closed_count;
                    } else {
                        count = evaluationSchedule.evaluatees_count;
                        openCount = evaluationSchedule.evaluatees_open_count;
                        closedCount = evaluationSchedule.evaluatees_closed_count;
                    }

                    return <PieChart series={[
                        {
                            data: [
                                { label: 'Open', value: openCount },
                                { label: 'Closed', value: closedCount },
                            ],
                        }
                    ]} slotProps={{
                        legend: { hidden: true },
                    }} sx={{ height: "100%"}} />;
                }
                return '-';
            },
        },
        {
            field: 'peer-evaluation',
            headerName: 'Peer Evaluation',
            flex: 0.2,
            renderCell: (cell) => {
                const evaluationSchedule = cell.row.evaluation_schedules.find(evaluationSchedule => evaluationSchedule.evaluation_type.code === cell.field);
                if (evaluationSchedule) {
                    const evaluationTypeCode = evaluationSchedule.evaluation_type.code;

                    let count;
                    let openCount;
                    let closedCount;

                    if (evaluationTypeCode === 'student-to-teacher-evaluation') {
                        count = evaluationSchedule.subject_classes_count;
                        openCount = evaluationSchedule.subject_classes_open_count;
                        closedCount = evaluationSchedule.subject_classes_closed_count;
                    } else {
                        count = evaluationSchedule.evaluatees_count;
                        openCount = evaluationSchedule.evaluatees_open_count;
                        closedCount = evaluationSchedule.evaluatees_closed_count;
                    }

                    return <PieChart series={[
                        {
                            data: [
                                { label: 'Open', value: openCount },
                                { label: 'Closed', value: closedCount },
                            ],
                        }
                    ]} slotProps={{
                        legend: { hidden: true },
                    }} sx={{ height: "100%"}} />;
                }
                return '-';
            },
        },
        {
            field: 'dean-to-teacher-evaluation',
            headerName: 'Dean to Teacher Evaluation',
            flex: 0.2,
            renderCell: (cell) => {
                const evaluationSchedule = cell.row.evaluation_schedules.find(evaluationSchedule => evaluationSchedule.evaluation_type.code === cell.field);
                if (evaluationSchedule) {
                    const evaluationTypeCode = evaluationSchedule.evaluation_type.code;

                    let count;
                    let openCount;
                    let closedCount;

                    if (evaluationTypeCode === 'student-to-teacher-evaluation') {
                        count = evaluationSchedule.subject_classes_count;
                        openCount = evaluationSchedule.subject_classes_open_count;
                        closedCount = evaluationSchedule.subject_classes_closed_count;
                    } else {
                        count = evaluationSchedule.evaluatees_count;
                        openCount = evaluationSchedule.evaluatees_open_count;
                        closedCount = evaluationSchedule.evaluatees_closed_count;
                    }

                    return <PieChart series={[
                        {
                            data: [
                                { label: 'Open', value: openCount },
                                { label: 'Closed', value: closedCount },
                            ],
                        }
                    ]} slotProps={{
                        legend: { hidden: true },
                    }} sx={{ height: "100%"}} />;
                }
                return '-';
            },
        },
        {
            field: 'self-evaluation',
            headerName: 'Self Evaluation',
            flex: 0.2,
            renderCell: (cell) => {
                const evaluationSchedule = cell.row.evaluation_schedules.find(evaluationSchedule => evaluationSchedule.evaluation_type.code === cell.field);
                if (evaluationSchedule) {
                    const evaluationTypeCode = evaluationSchedule.evaluation_type.code;

                    let count;
                    let openCount;
                    let closedCount;

                    if (evaluationTypeCode === 'student-to-teacher-evaluation') {
                        count = evaluationSchedule.subject_classes_count;
                        openCount = evaluationSchedule.subject_classes_open_count;
                        closedCount = evaluationSchedule.subject_classes_closed_count;
                    } else {
                        count = evaluationSchedule.evaluatees_count;
                        openCount = evaluationSchedule.evaluatees_open_count;
                        closedCount = evaluationSchedule.evaluatees_closed_count;
                    }

                    return <PieChart series={[
                        {
                            data: [
                                { label: 'Open', value: openCount },
                                { label: 'Closed', value: closedCount },
                            ],
                        }
                    ]} slotProps={{
                        legend: { hidden: true },
                    }} sx={{ height: "100%"}} />;
                }
                return '-';
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

                let actions = [
                    <GridActionsCellItem
                        component={Link}
                        href={`/reports/overall-evaluation-results/${row.academic_year}/${row.semester_id}/evaluatees`}
                        icon={<FolderOpen />}
                        label="View Schedule"
                        showInMenu
                    />
                ];

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
                Overall Evaluation Results
            </Typography>
            <DataGrid
                columns={columns}
                filterMode="server"
                onPaginationModelChange={handlePaginationChange}
                pageSizeOptions={[5, 10, 15]}
                paginationMode="server"
                paginationModel={paginationModel}
                rowCount={rowCount}
                rows={summativeReportList.data}
            />
        </>
    );
};

List.layout = page => <MainLayout children={page} title={"Overall Evaluation Results"} />;

export default List;