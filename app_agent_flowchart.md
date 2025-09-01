graph LR
A[User Interaction] --> B(App Receives Input);
B --> C{Is AI Agent Needed?};
C -- Yes --> D[AI Agent Processing];
C -- No --> E[Direct App Response];
D --> F{Process Message};
F --> G{Should Force Tool Usage?};
G -- Yes --> H[LLM with Tools Required];
G -- No --> I[LLM with Auto Tool Choice];
H --> J[Tool Execution];
I --> J;
J --> K[Tool Results];
K --> L[Session Service];
L --> M[Update Session Context];
M --> N[Generate Response];
N --> O[Assistant Message];
O --> P[Display Response to User];
E --> P;
P --> Q[End];
