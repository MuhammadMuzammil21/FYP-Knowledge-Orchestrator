'use client';

import { NODE_TYPE_CONFIG } from './graphStyles';
import type { SelectedNodeInfo } from './useGraphInteraction';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface GraphDetailPanelProps {
  node: SelectedNodeInfo | null;
  onClose: () => void;
}

export function GraphDetailPanel({ node, onClose }: GraphDetailPanelProps) {
  if (!node) return null;

  const cfg = NODE_TYPE_CONFIG[node.nodeType as keyof typeof NODE_TYPE_CONFIG] ?? NODE_TYPE_CONFIG.default;
  const darkMode = typeof window !== 'undefined'
    ? matchMedia('(prefers-color-scheme: dark)').matches
    : false;
  const badgeColor = darkMode ? cfg.darkColor : cfg.color;

  // Filter properties to display (exclude 'id')
  const displayProperties = Object.entries(node.originalNode.properties || {}).filter(
    ([key]) => key !== 'id'
  );

  // Group connections by edge type
  const connectionsByType = node.connections.reduce<Record<string, typeof node.connections>>((acc, conn) => {
    if (!acc[conn.edgeType]) acc[conn.edgeType] = [];
    acc[conn.edgeType].push(conn);
    return acc;
  }, {});

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 280,
        background: 'hsl(var(--card))',
        borderLeft: '1px solid hsl(var(--border))',
        borderRadius: '0 12px 12px 0',
        overflow: 'auto',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        borderBottom: '1px solid hsl(var(--border))',
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: badgeColor,
          background: `${badgeColor}18`,
          padding: '3px 8px',
          borderRadius: 6,
        }}>
          {node.nodeType}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            color: 'hsl(var(--muted-foreground))',
          }}
          aria-label="Close detail panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Name */}
      <div style={{ padding: '14px 14px 8px' }}>
        <h3 style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'hsl(var(--foreground))',
          margin: 0,
          lineHeight: 1.4,
          wordBreak: 'break-word',
        }}>
          {node.displayName}
        </h3>
      </div>

      {/* Properties */}
      {displayProperties.length > 0 && (
        <div style={{ padding: '0 14px 12px' }}>
          <h4 style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'hsl(var(--muted-foreground))',
            marginBottom: 8,
          }}>
            Properties
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {displayProperties.map(([key, value]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  color: 'hsl(var(--muted-foreground))',
                }}>
                  {key.replace(/_/g, ' ')}
                </span>
                <span style={{
                  fontSize: 13,
                  color: 'hsl(var(--foreground))',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connections */}
      {Object.keys(connectionsByType).length > 0 && (
        <div style={{ padding: '0 14px 14px' }}>
          <h4 style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'hsl(var(--muted-foreground))',
            marginBottom: 8,
          }}>
            Connections
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(connectionsByType).map(([edgeType, conns]) => (
              <div key={edgeType}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: badgeColor,
                  display: 'block',
                  marginBottom: 4,
                }}>
                  {edgeType.replace(/_/g, ' ')}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {conns.map((conn, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 12,
                      color: 'hsl(var(--foreground))',
                    }}>
                      {conn.direction === 'out' ? (
                        <ArrowRight size={12} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                      ) : (
                        <ArrowLeft size={12} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                      )}
                      <span style={{ wordBreak: 'break-word' }}>{conn.targetName}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
