import { Outlet } from 'react-router-dom';
import NavigationBar from "./NavigationBar/index"

const Layout = () => {
    return (
        <div>
            {/* <NavigationBar /> */}
            < main >
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;