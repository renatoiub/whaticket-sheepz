import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Badge, Collapse, List } from "@material-ui/core";

//icones 
import ChatOutlinedIcon from '@material-ui/icons/ChatOutlined';
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/ListAlt";
import LocalOfferTwoToneIcon from '@material-ui/icons/LocalOfferTwoTone';
import EventAvailableOutlinedIcon from '@material-ui/icons/EventAvailableOutlined';
import PieChartOutlinedIcon from '@material-ui/icons/PieChartOutlined';
import ContactlessOutlinedIcon from '@material-ui/icons/ContactlessOutlined';
import ContactSupportTwoToneIcon from '@material-ui/icons/ContactSupportTwoTone';
import ContactPhoneTwoToneIcon from '@material-ui/icons/ContactPhoneTwoTone';
import ForumOutlinedIcon from '@material-ui/icons/ForumOutlined';
import MonetizationOnOutlinedIcon from '@material-ui/icons/MonetizationOnOutlined';
import WrapTextOutlinedIcon from '@material-ui/icons/WrapTextOutlined';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import OfflineBoltOutlinedIcon from '@material-ui/icons/OfflineBoltOutlined';
import MobileFriendlyOutlinedIcon from '@material-ui/icons/MobileFriendlyOutlined';
import DnsTwoToneIcon from '@material-ui/icons/DnsTwoTone';
import AssignmentIcon from '@material-ui/icons/Assignment';
import LoyaltyRoundedIcon from '@material-ui/icons/LoyaltyRounded';
import ForumIcon from "@material-ui/icons/Forum";
import RotateRight from "@material-ui/icons/RotateRight";
import AccountBoxTwoToneIcon from '@material-ui/icons/AccountBoxTwoTone';
import DashboardOutlinedIcon from '@material-ui/icons/DashboardOutlined';
import SyncAltIcon from '@material-ui/icons/SyncAlt';
import AccountTreeOutlinedIcon from '@material-ui/icons/AccountTreeOutlined';
//fim de icones

import { makeStyles } from '@material-ui/core/styles';

import { AllInclusive, AttachFile, BlurCircular, DeviceHubOutlined, Schedule } from '@material-ui/icons';
import usePlans from "../hooks/usePlans";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { socketConnection } from "../services/socket";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";

function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink} className={className}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  // const history = useHistory();

  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false); const history = useHistory();

  const [showKanban, setShowKanban] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const { getPlanCompany } = usePlans();

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    if (localStorage.getItem("cshow")) {
      setShowCampaigns(true);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const handleClickLogout = () => {
    //handleCloseMenu();
    handleLogout();
  };

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const useStyles = makeStyles({
    estiloIcones: {
      color: '#083A5E', // Defina a cor desejada aqui
      paddingTop: "1px",
      paddingBottom: "1px",
    },
    estiloIconeDash: {
      color: '#083A5E', // Defina a cor desejada aqui
    },
    estiloIconeTickets: {
      color: '#083A5E', // Defina a cor desejada aqui
    },
    link: {
      paddingTop: "1px",
      paddingBottom: "1px",
      height: "30px", // Defina a altura desejada aqui
    }
  });

  const classes = useStyles();


  return (
    <div onClick={drawerClose}>

      <ListItemLink className={classes.link}
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<ChatOutlinedIcon className={classes.estiloIconeTickets} />}
      />

      {showKanban && (
        <ListItemLink className={classes.link}
          to="/kanban"
          primary="Kanban"
          icon={<LoyaltyRoundedIcon className={classes.estiloIcones} />}
        />
      )}

      <ListItemLink className={classes.link}
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<LocalOfferTwoToneIcon className={classes.estiloIcones} />}
      />

      <ListItemLink className={classes.link}
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<OfflineBoltOutlinedIcon className={classes.estiloIcones} />}
      />

      <ListItemLink className={classes.link}
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneTwoToneIcon className={classes.estiloIcones} />}
      />

      {showSchedules && (
        <>
          <ListItemLink className={classes.link}
            to="/schedules"
            primary={i18n.t("mainDrawer.listItems.schedules")}
            icon={<Schedule className={classes.estiloIcones} />}
          />
        </>
      )}

      {showInternalChat && (
        <>
          <ListItemLink className={classes.link}
            to="/chats"
            primary={i18n.t("mainDrawer.listItems.chats")}
            icon={
              <Badge color="secondary" variant="dot" invisible={invisible}>
                <ForumIcon className={classes.estiloIcones} />
              </Badge>
            }
          />
        </>
      )}

      <ListItemLink className={classes.link}
        to="/tasks"
        primary={'Tarefas'}
        icon={
          <Badge color="secondary" variant="dot" invisible={invisible}>
            <AssignmentIcon className={classes.estiloIcones} />
          </Badge>
        }
      />

      <ListItemLink className={classes.link}
        to="/helps"
        primary={i18n.t("mainDrawer.listItems.helps")}
        icon={<ContactSupportTwoToneIcon className={classes.estiloIcones} />}
      />

      <Can
        role={user.profile}
        perform="drawer-superv-items:view"
        yes={() => (
          <>
            <Divider />
            {/* <ListSubheader inset>
              {< AccountBoxTwoToneIcon style={{ color: "#113eba"[500], fontSize: 30 }} />}
              {i18n.t("mainDrawer.listItems.supervisory")}
            </ListSubheader> */}

            {/* <ListItemLink
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  <SyncAltIcon style={{ color: "#113eba"[500] }} />
                </Badge>
              }
            />
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlinedIcon style={{ color: "#113eba"[500] }} />}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<AccountTreeOutlinedIcon style={{ color: "#113eba"[500] }} />}
            /> */}
          </>
        )}
      />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset>
              {/* {i18n.t("mainDrawer.listItems.administration")} */}
            </ListSubheader>
            <ListItemLink className={classes.link}
              to="/"
              primary="Dashboard"
              icon={<PieChartOutlinedIcon className={classes.estiloIconeDash} />}
            />
            {showCampaigns && (
              <>
                <ListItem
                  button
                  onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                >
                  <ListItemIcon className={classes.link}>
                    <MobileFriendlyOutlinedIcon className={classes.estiloIcones} />
                  </ListItemIcon>
                  <ListItemText className={classes.link}
                    primary={i18n.t("mainDrawer.listItems.campaigns")}
                  />
                  {openCampaignSubmenu ? (
                    <ExpandLessIcon className={classes.estiloIcones} />
                  ) : (
                    <ExpandMoreIcon className={classes.estiloIcones} />
                  )}
                </ListItem>
                <Collapse
                  style={{ paddingLeft: 15 }}
                  in={openCampaignSubmenu}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    <ListItem className={classes.link} onClick={() => history.push("/campaigns")} button>
                      <ListItemIcon className={classes.estiloIcones}>
                        <ListIcon />
                      </ListItemIcon>
                      <ListItemText primary="Listagem" />
                    </ListItem>
                    <ListItem className={classes.link}
                      onClick={() => history.push("/contact-lists")}
                      button
                    >
                      <ListItemIcon className={classes.link}>
                        <PeopleIcon className={classes.estiloIcones} />
                      </ListItemIcon>
                      <ListItemText primary="Listas de Contatos" />
                    </ListItem>
                    <ListItem className={classes.link}
                      onClick={() => history.push("/campaigns-config")}
                      button
                    >
                      <ListItemIcon className={classes.link}>
                        <SettingsOutlinedIcon className={classes.estiloIcones} />
                      </ListItemIcon>
                      <ListItemText primary="Configurações" />
                    </ListItem>
                  </List>
                </Collapse>
              </>
            )}
            {user.super && (
              <ListItemLink className={classes.link}
                to="/Informativos"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<ErrorOutlineOutlinedIcon className={classes.estiloIcones} />}
              />
            )}
            {showOpenAi && (
              <ListItemLink className={classes.link}
                to="/prompts"
                primary={i18n.t("mainDrawer.listItems.prompts")}
                icon={<AllInclusive className={classes.estiloIcones} />}
              />
            )}
            {showIntegrations && (
              <ListItemLink className={classes.link}
                to="/queue-integration"
                primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                icon={<DeviceHubOutlined className={classes.estiloIcones} />}
              />
            )}
            <ListItemLink className={classes.link}
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  <ContactlessOutlinedIcon className={classes.estiloIcones} />
                </Badge>
              }
            />
            <ListItemLink className={classes.link}
              to="/files"
              primary={i18n.t("mainDrawer.listItems.files")}
              icon={<AttachFile className={classes.estiloIcones} />}
            />
            <ListItemLink className={classes.link}
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<WrapTextOutlinedIcon className={classes.estiloIcones} />}
            />
            <ListItemLink className={classes.link}
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlinedIcon className={classes.estiloIcones} />}
            />
            {showExternalApi && (
              <>
                <ListItemLink className={classes.link}
                  to="/messages-api"
                  primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                  icon={<CodeRoundedIcon className={classes.estiloIcones} />}
                />
              </>
            )}
            <ListItemLink className={classes.link}
              to="/financeiro"
              primary={i18n.t("mainDrawer.listItems.financeiro")}
              icon={<MonetizationOnOutlinedIcon className={classes.estiloIcones} />}
            />
            <ListItemLink className={classes.link}
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlinedIcon className={classes.estiloIcones} />}
            />
            {/*             <ListItemLink className={classes.link}
              to="/subscription"
              primary="Assinatura"
              icon={<PaymentIcon />}
              //className={classes.menuItem}
            /> */}
          </>
        )}
      />

      {/* <can
        role={user.profile}
        perform="drawer-superv-items:view"
        yes={() => (
          <ListItemLink className={classes.link}
            to="/"
            primary="Dashboard"
            icon={<PieChartOutlinedIcon className={classes.estiloIconeDash} />}
          />
        )}


      /> */}

      <Divider />
      <li>
        <ListItem className={classes.link}
          button
          dense
          onClick={handleClickLogout}>
          <ListItemIcon><RotateRight className={classes.estiloIcones}/></ListItemIcon>
          <ListItemText primary={i18n.t("Sair")} />
        </ListItem>
      </li>


    </div>
  );
};

export default MainListItems;
