import { router } from "@inertiajs/react";
import { DataGrid } from "@mui/x-data-grid";
import MainLayout from "../../MainLayout";
import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, Fab, TextField } from "@mui/material";
import { Add, ArchiveTwoTone, CheckTwoTone, DeleteTwoTone, FileOpenTwoTone } from "@mui/icons-material";
import React from 'react';

const List = ({ evaluationForms }) => {
    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const showEvaluationForm = (id) => () => {
        router.get(`evaluation-forms/${id}`);
    };

    const deleteEvaluationForm = (id) => () => {
        router.delete(`evaluation-forms/${id}`);
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
        },
        {
            field: 'title',
            flex: 1,
            headerName: 'Title',
        },
        {
            field: 'published',
            filterable: false,
            flex: 0.05,
            headerName: 'Status',
            renderCell: ({ value }) => {
                return Boolean(value) ? <CheckTwoTone htmlColor="green" /> : null;
            },
            sortable: false,

        },
        {
            filterable: false,
            flex: 0.2,
            renderCell: ({ row: evaluationForm }) => {
                return <ButtonGroup variant="text">
                    <Button onClick={showEvaluationForm(evaluationForm.id)}>
                        <FileOpenTwoTone />
                    </Button>
                    {Boolean(evaluationForm.published)
                        ? <Button>
                            <ArchiveTwoTone />
                        </Button> :
                        <Button onClick={deleteEvaluationForm(evaluationForm.id)}>
                            <DeleteTwoTone />
                        </Button>}
                </ButtonGroup>;
            },
            sortable: false,
        },
    ];

    return (
        <>
            <Fab onClick={() => { setOpen(true) }} sx={{ mb: 2 }}>
                <Add />
            </Fab>
            <DataGrid
                columns={columns}
                rows={evaluationForms}
                autoHeight></DataGrid>

            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());
                        router.post(`/evaluation-forms`, formJson);
                        handleClose();
                    }
                }}>
                <DialogTitle>New Evaluation Form</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        label="Title"
                        margin="dense"
                        name="title" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Create</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

List.layout = page => <MainLayout children={page} title="Evaluation Forms" />;

export default List;