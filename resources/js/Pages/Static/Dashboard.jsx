import { Card, CardContent } from "@mui/material";
import MainLayout from "../../MainLayout";

const Dashboard = () => {
    return <>
        <Card>
            <CardContent>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Non eligendi unde itaque ducimus ab ipsa aperiam debitis quos
                minus beatae quibusdam omnis, odit quo nesciunt ipsum
                asperiores quod dolores? Tenetur!
            </CardContent>
        </Card>
    </>;
};

Dashboard.layout = page => <MainLayout children={page} title="Dashboard"/>;

export default Dashboard;