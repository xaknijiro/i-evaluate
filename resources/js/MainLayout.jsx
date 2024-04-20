import { Head, router } from "@inertiajs/react";
import { AssessmentTwoTone, CalendarMonthTwoTone, DashboardTwoTone, FolderTwoTone, InfoTwoTone, Menu, SettingsTwoTone } from "@mui/icons-material";
import { AppBar, Avatar, Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Toolbar, Typography } from "@mui/material";
import React from 'react';

const MainLayout = ({ children, title }) => {
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    const routeToPage = (url) => () => {
        router.get(`/${url ?? ''}`);
    };

    const MainMenu = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={routeToPage()}>
                        <ListItemIcon>
                            <DashboardTwoTone />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <CalendarMonthTwoTone />
                        </ListItemIcon>
                        <ListItemText primary="Evaluation Schedule" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <AssessmentTwoTone />
                        </ListItemIcon>
                        <ListItemText primary="Generate Report" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={routeToPage('evaluation-forms')}>
                        <ListItemIcon>
                            <FolderTwoTone />
                        </ListItemIcon>
                        <ListItemText primary="Evaluation Forms" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <SettingsTwoTone />
                        </ListItemIcon>
                        <ListItemText primary="General Settings" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={routeToPage('about')}>
                        <ListItemIcon>
                            <InfoTwoTone />
                        </ListItemIcon>
                        <ListItemText primary="About" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return <>
        <Head>
            <title>{title}</title>
            <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        </Head>
        <Box sx={{ flexGrow: 1 }}>
            <React.Fragment>
                <AppBar position="fixed">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={toggleDrawer(true)}
                        >
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            I-Evaluate | {title}
                        </Typography>
                        <Avatar>DM</Avatar>
                    </Toolbar>
                </AppBar>
                <Toolbar />
            </React.Fragment>
        </Box>
        <Drawer open={open} onClose={toggleDrawer(false)}>
            {MainMenu}
        </Drawer>
        <Paper
            elevation={3}
            maxWidth={false}
            sx={{ p: 2, m: 2 }}>{children}</Paper>
    </>;
};

export default MainLayout;