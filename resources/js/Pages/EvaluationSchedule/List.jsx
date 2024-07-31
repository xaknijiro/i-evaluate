import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MainLayout from "../../MainLayout";
import { IconButton } from "@mui/material";
import { Lock, LockOpen } from "@mui/icons-material";
import React from 'react';
import { router } from "@inertiajs/react";

const List = ({ evaluationSchedules }) => {
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
    ];

    return (
        <>
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