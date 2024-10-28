import { router } from "@inertiajs/react";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, ButtonGroup, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, Grid, IconButton, InputAdornment, Paper, Rating, Stack, TextField, Typography } from "@mui/material";
import MainLayout from "../../MainLayout";
import { AddTwoTone, ArrowCircleDownTwoTone, ArrowCircleUpTwoTone, DeleteForeverTwoTone, MenuTwoTone, RemoveTwoTone } from "@mui/icons-material";
import React from "react";

const Show = ({ errors, evaluationForm }) => {
    const published = !!evaluationForm.published;
    const { likert_scale: likertScale } = evaluationForm;
    const { default_options: options } = likertScale;

    const defaultCriterionIndicators = published ? [] : [""];
    const initialCriterionWeights = {};
    const initialCriteriaIndicators = {};
    evaluationForm.criteria.forEach((criterion) => {
        initialCriterionWeights[`criterion_${criterion.id}`] = criterion.weight * 100;
        initialCriteriaIndicators[`criterion_${criterion.id}`] = criterion.indicators.length > 0
            ? criterion.indicators.map((indicator) => indicator.description)
            : defaultCriterionIndicators;
    });
    const initialTotalWeight = Object.keys(initialCriterionWeights).reduce(function (previous, key) {
        return previous + initialCriterionWeights[key];
    }, 0);
    const [criterionWeights, setCriterionWeights] = React.useState(initialCriterionWeights);
    const [totalWeight, setTotalWeight] = React.useState(initialTotalWeight);
    const [criteriaIndicators, setCriteriaIndicators] = React.useState(initialCriteriaIndicators);

    const deleteCriterion = (criterionId) => (e) => {
        e.stopPropagation();
        router.delete(
            `/evaluation-forms/${evaluationForm.id}/criteria/${criterionId}`,
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    const handleChangeCriterionIndicator = (criterionId, index) => (e) => {
        const updatedCriterionIndicators = criteriaIndicators;
        updatedCriterionIndicators[`criterion_${criterionId}`][index] = e.target.value;
        const indicators = { ...criteriaIndicators, ...updatedCriterionIndicators };
        setCriteriaIndicators(indicators);
        router.patch(
            `/evaluation-forms/${evaluationForm.id}/criteria/${criterionId}`,
            {
                indicators: updatedCriterionIndicators[`criterion_${criterionId}`].map((indicator) => (
                    {
                        description: indicator
                    }
                ))
            },
            {
                preserveScroll: true,
            }
        );
    };

    const handleChangeCriterionDescription = (criterionId) => (e) => {
        router.patch(
            `/evaluation-forms/${evaluationForm.id}/criteria/${criterionId}`,
            {
                'description': e.target.value,
            },
            {
                preserveScroll: true,
            }
        );
    };

    const handleChangeCriterionWeight = (criterionId) => (e) => {
        const updatedCriterionWeights = criterionWeights;
        router.patch(
            `/evaluation-forms/${evaluationForm.id}/criteria/${criterionId}`,
            {
                'weight': +e.target.value / 100,
            },
            {
                preserveScroll: true,
            }
        );
        updatedCriterionWeights[`criterion_${criterionId}`] = +e.target.value;
        const updatedTotalWeight = Object.keys(updatedCriterionWeights).reduce(function (previous, key) {
            return previous + updatedCriterionWeights[key];
        }, 0);
        setCriterionWeights(updatedCriterionWeights);
        setTotalWeight(updatedTotalWeight);
    };

    const handleUpdateEvaluationForm = (attribute) => (e) => {
        const value = attribute === 'published' ? 1 : e.target.value;
        router.patch(
            `/evaluation-forms/${evaluationForm.id}`,
            {
                [attribute]: value,
            },
            {
                preserveScroll: true,
            }
        );
    };

    const addCriterionIndicator = (criterionId, index) => () => {
        const updatedCriterionIndicators = criteriaIndicators;
        updatedCriterionIndicators[`criterion_${criterionId}`].splice(index + 1, 0, "");
        const indicators = { ...criteriaIndicators, ...updatedCriterionIndicators };
        setCriteriaIndicators(indicators);
    };

    const deleteCriterionIndicator = (criterionId, index) => () => {
        const updatedCriterionIndicators = criteriaIndicators;
        updatedCriterionIndicators[`criterion_${criterionId}`].splice(index, 1);
        const indicators = { ...criteriaIndicators, ...updatedCriterionIndicators };
        setCriteriaIndicators(indicators);
        router.patch(
            `/evaluation-forms/${evaluationForm.id}/criteria/${criterionId}`,
            {
                indicators: updatedCriterionIndicators[`criterion_${criterionId}`].map((indicator) => (
                    {
                        description: indicator
                    }
                ))
            }
        );
    };

    const handleSaveEvaluationForm = () => {
        evaluationForm.criteria.forEach((criterion) => {
            router.patch(
                `/evaluation-forms/${evaluationForm.id}/criteria/${criterion.id}`,
                {
                    description: criterion.description,
                    weight: criterion.weight,
                    indicators: criteriaIndicators[`criterion_${criterion.id}`].map((indicator) => (
                        {
                            description: indicator
                        }
                    ))
                }
            );
        });
    };

    const [open, setOpen] = React.useState(false);
    const handleClose = () => {
        setOpen(false);
    };


    const indicatorRatingElementPublished = (criterion, description, no) => <Box>
        <Stack
            alignContent="center"
            direction="row"
            spacing={2} sx={{ mb: 2 }}>
            <Typography>{no}.</Typography>
            <Typography>{description}</Typography>
        </Stack>
        {criterion.is_weighted
            ? <Rating size="large" sx={{ ml: 3 }} disabled />
            : <TextField fullWidth multiline rows={3} disabled />}
        <Divider />
    </Box>;

    const indicatorElementUnpublished = (criterion, description, index) => <Box>
        <Grid container>
            <Grid item md={11}>
                <TextField
                    defaultValue={description}
                    onChange={handleChangeCriterionIndicator(criterion.id, index)}
                    rows={2}
                    value={description}
                    variant="outlined"
                    multiline
                    fullWidth />
            </Grid>
            <Grid item md={1}>
                <ButtonGroup variant="text">
                    <IconButton>
                        <AddTwoTone onClick={addCriterionIndicator(criterion.id, index)} />
                    </IconButton>
                    {(index > 0) && <IconButton>
                        <RemoveTwoTone onClick={deleteCriterionIndicator(criterion.id, index)} />
                    </IconButton>}
                </ButtonGroup>
            </Grid>
            <Divider />
        </Grid>
    </Box>;

    return <>
        {!!evaluationForm.published
            ? <>
                <Typography>
                    <h1>{evaluationForm.title}</h1>
                </Typography>
                <Typography sx={{marginBottom: 2}}>
                    {evaluationForm.description}
                </Typography>
            </>
            : <>
                <TextField
                    defaultValue={evaluationForm.title}
                    label="Title"
                    onChange={handleUpdateEvaluationForm('title')}
                    sx={{marginBottom: 2}}
                    fullWidth/>
                <TextField
                    defaultValue={evaluationForm.description}
                    label="Description"
                    onChange={handleUpdateEvaluationForm('description')}
                    sx={{ marginBottom: 2 }}
                    fullWidth
                    multiline />
            </>}

        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                component: 'form',
                onSubmit: (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries(formData.entries());
                    router.post(
                        `/evaluation-forms/${evaluationForm.id}/criteria`,
                        formJson,
                        {
                            preserveScroll: true,
                            preserveState: false,
                        }
                    );
                    handleClose();
                }
            }}>
            <DialogTitle>Add Criterion</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    fullWidth
                    required
                    label="Description"
                    margin="dense"
                    name="description" />
                <FormControlLabel control={<Checkbox defaultChecked name="weighted" />} label="Weighted" />
            </DialogContent>
            <DialogActions>
                <ButtonGroup variant="contained">
                    <Button color="secondary" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" color="primary">Create</Button>
                </ButtonGroup>
            </DialogActions>
        </Dialog>

        <Paper variant="outlined" elevation={1} sx={{ padding: 5 }}>
            <Stack
                direction={{ sm: "column", md: "row" }}
                divider={<Divider flexItem />}
                flexWrap="wrap"
                spacing={{ xs: 1, sm: 2 }}
                useFlexGap>
                {options.map((option, i) =>
                    <Box
                        key={`option-${i}`}
                        alignItems="center"
                        textAlign="center">
                        <Rating
                            defaultValue={option.value}
                            size="large"
                            disabled
                        />
                        <Typography>{option.label}</Typography>
                    </Box>)}
            </Stack>
        </Paper>

        {criteriaIndicators && evaluationForm.criteria.map((criterion, criterionIndex) => (
            <>
                <Accordion
                    defaultExpanded={!!evaluationForm.published}>
                    <AccordionSummary>
                        {!!evaluationForm.published
                            ? <Typography sx={{ flex: 1 }} variant="h5">
                                {criterion.description}
                            </Typography>
                            : <TextField
                                defaultValue={criterion.description}
                                error={!!errors.criterion_id && errors.criterion_id === criterion.id}
                                helperText={
                                    (!!errors.criterion_id && errors.criterion_id === criterion.id) &&
                                    errors.description
                                }
                                label="Criterion"
                                onChange={handleChangeCriterionDescription(criterion.id)}
                                onClick={(e) => e.stopPropagation()}
                                sx={{ flex: 1 }}
                                variant="standard" />}
                        {criterion.is_weighted && (!!evaluationForm.published
                            ? <Chip label={`${criterion.weight * 100}%`} />
                            : <TextField
                                label="Weight"
                                InputProps={{
                                    endAdornment: <InputAdornment>%</InputAdornment>,
                                    min: 0,
                                    inputProps: { style: { textAlign: "right" } }
                                }}
                                onChange={handleChangeCriterionWeight(criterion.id)}
                                onClick={(e) => e.stopPropagation()}
                                defaultValue={criterion.weight * 100}
                                type="number"
                                sx={{ width: 75 }}
                                variant="standard" />)}
                        {!!!evaluationForm.published && <ButtonGroup>
                            <IconButton onClick={() => false}>
                                <MenuTwoTone />
                            </IconButton>
                            <IconButton disabled={criterionIndex === 0}>
                                <ArrowCircleUpTwoTone />
                            </IconButton>
                            <IconButton disabled={criterionIndex >= evaluationForm.criteria.length - 1}>
                                <ArrowCircleDownTwoTone />
                            </IconButton>
                            <IconButton onClick={deleteCriterion(criterion.id)}>
                                <DeleteForeverTwoTone />
                            </IconButton>
                        </ButtonGroup>}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack spacing={2}>
                            {criteriaIndicators[`criterion_${criterion.id}`]
                                .map((description, index) => (
                                    !!evaluationForm.published
                                        ? indicatorRatingElementPublished(criterion, description, index + 1)
                                        : indicatorElementUnpublished(criterion, description, index)
                                ))}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            </>
        )
        )}

        <Box sx={{ display: "flex", flexDirection: "row-reverse", mt: 2 }}>
            {Boolean(evaluationForm.published) ? <ButtonGroup variant="contained">
                <Button>Archive</Button>
            </ButtonGroup> : <ButtonGroup variant="contained">
                <Button color="secondary" onClick={() => setOpen(true)}>Add Criterion</Button>
                <Button color="secondary" onClick={handleSaveEvaluationForm}>Save</Button>
                <Button
                    disabled={Object.keys(errors).length > 0 || totalWeight !== 100}
                    onClick={handleUpdateEvaluationForm('published')}>Publish</Button>
            </ButtonGroup>}
        </Box>
    </>;
};

Show.layout = page => <MainLayout children={page} title="Evaluation Form" />;

export default Show;