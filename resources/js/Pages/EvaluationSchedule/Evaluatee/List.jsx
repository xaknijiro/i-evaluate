import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import { FolderOpen, Lock, LockOpen } from "@mui/icons-material";
import React from 'react';
import { Link, router } from "@inertiajs/react";
import MainLayout from "../../../MainLayout";

const List = ({ evaluationSchedule, evaluatees }) => {
    const { id } = evaluationSchedule.data;

    const [paginationModel, setPaginationModel] = React.useState({
        page: evaluatees.meta.current_page - 1,
        pageSize: evaluatees.meta.per_page,
    });

    const rowCountRef = React.useRef(evaluatees?.meta.total || 0);

    const rowCount = React.useMemo(() => {
        if (evaluatees?.meta.total !== undefined) {
            rowCountRef.current = evaluatees.meta.total;
        }
        return rowCountRef.current;
    }, [evaluatees?.meta.total]);

    const handlePaginationChange = (newPaginationModel) => {
        router.get(`/evaluation-schedules/${id}/evaluatees`, {
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
            headerName: 'ID',
        },
        {
            field: 'last_name',
            flex: 0.25,
            headerName: 'Last Name',
        },
        {
            field: 'first_name',
            flex: 0.25,
            headerName: 'First Name',
        },
        {
            field: 'email',
            flex: 0.5,
            headerName: 'Email',
        },
        {
            flex: 1,
        },
    ];

    return (
        <>
            <DataGrid
                columns={columns}
                density="compact"
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

List.layout = page => <MainLayout children={page} title="Evaluation Forms" />;

export default List;