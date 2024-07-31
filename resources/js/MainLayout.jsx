import { Head, router, usePage } from "@inertiajs/react";
import { AccountCircle, AssessmentTwoTone, CalendarMonthTwoTone, DashboardTwoTone, FolderTwoTone, InfoTwoTone, Logout, Menu, Password, SettingsTwoTone } from "@mui/icons-material";
import { AppBar, Avatar, Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Toolbar, Typography } from "@mui/material";
import React from 'react';

const MainLayout = ({ children, title }) => {
    const { auth } = usePage().props;
    const { email, name } = auth;
    const [openAppDrawer, setOpenAppDrawer] = React.useState(false);
    const [openUserDrawer, setOpenUserDrawer] = React.useState(false);

    const toggleAppDrawer = (newOpenAppDrawer) => () => {
        setOpenAppDrawer(newOpenAppDrawer);
    };

    const toggleUserDrawer = (newOpenUserDrawer) => () => {
        setOpenUserDrawer(newOpenUserDrawer);
    };

    const routeToPage = (url) => () => {
        router.get(`/${url ?? ''}`);
    };

    const logout = () => {
        router.post('/logout');
    };

    const AppMenu = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleAppDrawer(false)}>
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
                    <ListItemButton onClick={routeToPage('evaluation-schedules')}>
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

    const UserMenu = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleUserDrawer(false)}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <AccountCircle />
                </Avatar>
                <Typography variant="h5">{name}</Typography>
                <Typography variant="caption">{email}</Typography>
            </Box>
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={routeToPage()}>
                        <ListItemIcon>
                            <Password />
                        </ListItemIcon>
                        <ListItemText primary="Change Password" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={logout}>
                        <ListItemIcon>
                            <Logout />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
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
                            onClick={toggleAppDrawer(true)}
                        >
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            I-Evaluate | {title}
                        </Typography>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={toggleUserDrawer(true)}
                        >
                            <AccountCircle />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Toolbar />
            </React.Fragment>
        </Box>

        <Drawer anchor="left" open={openAppDrawer} onClose={toggleAppDrawer(false)}>
            {AppMenu}
        </Drawer>

        <Drawer anchor="right" open={openUserDrawer} onClose={toggleUserDrawer(false)}>
            {UserMenu}
        </Drawer>

        <Paper
            elevation={3}
            maxWidth={false}
            sx={{ p: 2, m: 2 }}>{children}</Paper>
    </>;
};

export default MainLayout;