// Component style overrides for Cerulík AI Task Manager
// These define consistent styling for common Chakra UI components

export const components = {
  // Button styles
  Button: {
    baseStyle: {
      fontWeight: "500",
      borderRadius: "md",
      _focus: {
        boxShadow: "outline",
      },
    },
    variants: {
      solid: (props: any) => ({
        bg: props.colorScheme === "brand" ? "brand.500" : `${props.colorScheme}.500`,
        color: "white",
        _hover: {
          bg: props.colorScheme === "brand" ? "brand.600" : `${props.colorScheme}.600`,
          _disabled: {
            bg: props.colorScheme === "brand" ? "brand.500" : `${props.colorScheme}.500`,
          },
        },
        _active: {
          bg: props.colorScheme === "brand" ? "brand.700" : `${props.colorScheme}.700`,
        },
      }),
      outline: (props: any) => ({
        border: "1px solid",
        borderColor: props.colorScheme === "brand" ? "brand.500" : `${props.colorScheme}.500`,
        color: props.colorScheme === "brand" ? "brand.500" : `${props.colorScheme}.500`,
        bg: "transparent",
        _hover: {
          bg: props.colorScheme === "brand" ? "brand.50" : `${props.colorScheme}.50`,
        },
        _active: {
          bg: props.colorScheme === "brand" ? "brand.100" : `${props.colorScheme}.100`,
        },
      }),
      ghost: (props: any) => ({
        bg: "transparent",
        color: props.colorScheme === "brand" ? "brand.500" : `${props.colorScheme}.500`,
        _hover: {
          bg: props.colorScheme === "brand" ? "brand.50" : `${props.colorScheme}.50`,
        },
        _active: {
          bg: props.colorScheme === "brand" ? "brand.100" : `${props.colorScheme}.100`,
        },
      }),
      link: (props: any) => ({
        padding: 0,
        height: "auto",
        lineHeight: "normal",
        color: props.colorScheme === "brand" ? "brand.500" : `${props.colorScheme}.500`,
        _hover: {
          textDecoration: "underline",
        },
        _active: {
          color: props.colorScheme === "brand" ? "brand.700" : `${props.colorScheme}.700`,
        },
      }),
    },
    defaultProps: {
      colorScheme: "brand",
      size: "md",
      variant: "solid",
    },
  },

  // Card style for consistent card components
  Card: {
    baseStyle: {
      container: {
        borderRadius: "lg",
        boxShadow: "md",
        bg: "white",
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        _hover: {
          boxShadow: "lg",
          transform: "translateY(-2px)",
        },
        _dark: {
          bg: "gray.800",
        },
      },
      header: {
        padding: "4",
        borderBottom: "1px solid",
        borderColor: "gray.200",
        _dark: {
          borderColor: "gray.700",
        },
      },
      body: {
        padding: "4",
      },
      footer: {
        padding: "4",
        borderTop: "1px solid",
        borderColor: "gray.200",
        _dark: {
          borderColor: "gray.700",
        },
      },
    },
    variants: {
      elevated: {
        container: {
          boxShadow: "md",
          _hover: {
            boxShadow: "lg",
          },
        },
      },
      outline: {
        container: {
          border: "1px solid",
          borderColor: "gray.200",
          boxShadow: "none",
          _dark: {
            borderColor: "gray.700",
          },
        },
      },
      filled: {
        container: {
          bg: "gray.50",
          boxShadow: "none",
          _dark: {
            bg: "gray.700",
          },
        },
      },
      unstyled: {
        container: {
          bg: "none",
          boxShadow: "none",
          _hover: {
            boxShadow: "none",
            transform: "none",
          },
        },
        header: {
          padding: 0,
          borderBottom: "none",
        },
        body: {
          padding: 0,
        },
        footer: {
          padding: 0,
          borderTop: "none",
        },
      },
    },
    defaultProps: {
      variant: "elevated",
    },
  },

  // Input styles
  Input: {
    baseStyle: {
      field: {
        borderRadius: "md",
        _focus: {
          boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
          borderColor: "brand.500",
        },
      },
    },
    variants: {
      outline: {
        field: {
          border: "1px solid",
          borderColor: "gray.300",
          _dark: {
            borderColor: "gray.600",
            bg: "gray.800",
          },
          _hover: {
            borderColor: "gray.400",
            _dark: {
              borderColor: "gray.500",
            },
          },
        },
      },
      filled: {
        field: {
          bg: "gray.100",
          _dark: {
            bg: "gray.700",
          },
          _hover: {
            bg: "gray.200",
            _dark: {
              bg: "gray.600",
            },
          },
          _focus: {
            bg: "white",
            _dark: {
              bg: "gray.800",
            },
          },
        },
      },
    },
    defaultProps: {
      variant: "outline",
      size: "md",
    },
  },

  // Checkbox styles
  Checkbox: {
    baseStyle: {
      control: {
        borderRadius: "sm",
        _focus: {
          boxShadow: "0 0 0 2px var(--chakra-colors-brand-500)",
        },
        _checked: {
          bg: "brand.500",
          borderColor: "brand.500",
          _hover: {
            bg: "brand.600",
            borderColor: "brand.600",
          },
        },
      },
    },
  },

  // Table styles
  Table: {
    baseStyle: {
      table: {
        fontVariantNumeric: "lining-nums tabular-nums",
        borderCollapse: "collapse",
        width: "100%",
      },
      th: {
        fontFamily: "heading",
        fontWeight: "bold",
        textTransform: "none",
        letterSpacing: "normal",
        textAlign: "start",
      },
      td: {
        textAlign: "start",
      },
      caption: {
        mt: 4,
        fontFamily: "heading",
        textAlign: "center",
        fontWeight: "normal",
      },
    },
    variants: {
      simple: {
        th: {
          color: "gray.600",
          borderBottom: "1px",
          borderColor: "gray.200",
          _dark: {
            color: "gray.400",
            borderColor: "gray.700",
          },
        },
        td: {
          borderBottom: "1px",
          borderColor: "gray.200",
          _dark: {
            borderColor: "gray.700",
          },
        },
        tbody: {
          tr: {
            _hover: {
              bg: "gray.50",
              _dark: {
                bg: "gray.700",
              },
            },
          },
        },
        tfoot: {
          tr: {
            th: {
              borderTop: "1px",
              borderColor: "gray.200",
              _dark: {
                borderColor: "gray.700",
              },
            },
          },
        },
      },
      striped: {
        th: {
          color: "gray.600",
          borderBottom: "1px",
          borderColor: "gray.200",
          _dark: {
            color: "gray.400",
            borderColor: "gray.700",
          },
        },
        td: {
          borderBottom: "1px",
          borderColor: "gray.200",
          _dark: {
            borderColor: "gray.700",
          },
        },
        tbody: {
          tr: {
            "&:nth-of-type(odd)": {
              bg: "gray.50",
              _dark: {
                bg: "gray.700",
              },
            },
            _hover: {
              bg: "gray.100",
              _dark: {
                bg: "gray.600",
              },
            },
          },
        },
      },
    },
    defaultProps: {
      variant: "simple",
    },
  },

  // Other important components
  Tabs: {
    variants: {
      line: {
        tab: {
          _selected: {
            color: "brand.500",
            borderColor: "brand.500",
          },
          _active: {
            bg: "brand.50",
          },
        },
      },
    },
    defaultProps: {
      colorScheme: "brand",
      variant: "line",
    },
  },
};
