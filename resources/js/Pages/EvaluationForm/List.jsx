import { router } from "@inertiajs/react";
import { DataGrid } from "@mui/x-data-grid";
import MainLayout from "../../MainLayout";
import { Button, ButtonGroup } from "@mui/material";
import { ArchiveTwoTone, CheckTwoTone, DeleteTwoTone, FileOpenTwoTone } from "@mui/icons-material";

const List = ({ evaluationForms }) => {
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
            <DataGrid
                columns={columns}
                rows={evaluationForms}
                autoHeight></DataGrid>
        </>
    );
};

List.layout = page => <MainLayout children={page} title="Evaluation Forms" />;

export default List;