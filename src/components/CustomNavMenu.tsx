import React from 'react';
import { NavMenuApp } from '@consalud/core';
import { useMenuConfig } from '../contex/MenuConfigContext'; 
import { useLocation, useNavigate } from 'react-router-dom';

interface MenuItemStyles {
  container: React.CSSProperties;
  item: React.CSSProperties;
  itemActive: React.CSSProperties;
  icon: React.CSSProperties;
}

interface MenuItem {
  path: string;
  label: string;
  icon?: string;
}

const CustomNavMenu: React.FC = () => {
  const { customMenuItems } = useMenuConfig();
  const location = useLocation();
  const navigate = useNavigate();
  
  const styles: MenuItemStyles = {
    container: {
      listStyle: 'none',
      padding: 0,
      margin: '10px 0'
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      margin: '2px 0',
      borderRadius: '4px',
      textDecoration: 'none',
      color: '#444',
      backgroundColor: 'transparent',
      fontWeight: 400,
      transition: 'all 0.2s ease',
      borderLeft: '3px solid transparent',
      paddingLeft: '12px',
      cursor: 'pointer'
    },
    itemActive: {
      color: '#04A59B',
      backgroundColor: 'rgba(4, 165, 155, 0.1)',
      fontWeight: 500,
      borderLeft: '3px solid #04A59B',
      paddingLeft: '9px',
    },
    icon: {
      marginRight: '8px'
    }
  };
  
  // Crear elementos de menú personalizados
  const renderCustomItems = () => {
    if (!customMenuItems || customMenuItems.length === 0) return null;
    
    return (
      <ul style={styles.container}>
        {customMenuItems.map((item: MenuItem, index: number) => {
          const isActive = location.pathname === item.path;
          
          return (
            <li key={index}>
              <a  // Añadida la etiqueta <a> que faltaba
                href={item.path}
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                style={{
                  ...styles.item,
                  ...(isActive ? styles.itemActive : {})
                }}
              >
                {item.icon && <span style={styles.icon}>{item.icon}</span>}
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    );
  };
  
  return (
    <div>
      <NavMenuApp />
      {renderCustomItems()}
    </div>
  );
};

export default CustomNavMenu;