import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MainLayout from "../../MainLayout";
import { Box, Button, Link, Paper, Stack, styled } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import React from 'react';
import { router } from "@inertiajs/react";

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

const List = ({ subjects }) => {
    const [paginationModel, setPaginationModel] = React.useState({
        page: subjects.meta.current_page - 1,
        pageSize: subjects.meta.per_page,
    });

    const rowCountRef = React.useRef(subjects.meta.total || 0);

    const rowCount = React.useMemo(() => {
        if (subjects.meta.total !== undefined) {
            rowCountRef.current = subjects.meta.total;
        }
        return rowCountRef.current;
    }, [subjects.meta.total]);

    const handlePaginationChange = (newPaginationModel) => {
        router.get('/subjects', {
            page: newPaginationModel.page + 1,
            per_page: newPaginationModel.pageSize,
        }, {
            preserveScroll: true,
            onSuccess: () => setPaginationModel(newPaginationModel),
        });
    };

    const columns = [
        {
            field: 'code',
            flex: 0.25,
            headerName: 'Code',
        },
        {
            field: 'title',
            flex: 0.5,
            headerName: 'Title',
        },
        {
            field: 'department',
            flex: 0.5,
            headerName: 'Department',
            valueGetter: (cell) => `${cell.row.department.code} - ${cell.row.department.title}`,
        }
    ];

    const handleImport = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries(formData.entries());
        console.log(formJson);
        router.post(`/subjects`, formJson, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    return (
        <>
            <Paper sx={{ marginBottom: 2, padding: 2, width: '25%' }}>
                <Box component="form" marginBottom={2} onSubmit={handleImport}>
                    <Stack spacing={2}>
                        <Button
                            component="label"
                            role={undefined}
                            variant="contained"
                            tabIndex={-1}
                            startIcon={<CloudUpload />}
                            onSubmit={handleImport}
                        >
                            Upload Subjects
                            <VisuallyHiddenInput type="file" name="subjects" />
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                        >
                            Import
                        </Button>
                    </Stack>
                </Box>
                <Link
                    href="/import-templates/subjects"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Dowload Template
                </Link>
            </Paper>
            <DataGrid
                columns={columns}
                onPaginationModelChange={handlePaginationChange}
                pageSizeOptions={[5, 10, 15]}
                paginationMode="server"
                paginationModel={paginationModel}
                rowCount={rowCount}
                rows={subjects.data}
                slots={{ toolbar: GridToolbar }}
            />
        </>
    );
};

List.layout = page => <MainLayout children={page} title="Evaluation Forms" />;

export default List;