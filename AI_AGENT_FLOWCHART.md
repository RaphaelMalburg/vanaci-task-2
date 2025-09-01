
# AI Agent Workflow - Complete Mermaid Flowchart

## 🎯 Agent Architecture Overview

```mermaid
graph TD
    A[User Input] --> B[AI Agent Core]
    B --> C{Input Type Analysis}
    
    C -->|Product Query| D[Product Search Tools]
    C -->|Cart Operation| E[Cart Management Tools]
    C -->|Navigation| F[Navigation Tools]
    C -->|Budget Check| G[Budget Tools]
    C -->|Checkout| H[Checkout Tools]
    
    D --> I[Search Products]
    D --> J[Get Product Details]
    
    E --> K{Cart Operation Type}
    K -->|Add| L[Add to Cart]
    K -->|Remove| M[Remove from Cart]
    K -->|Update| N[Update Quantity]
    K -->|View| O[View Cart]
    K -->|Clear| P[Clear Cart]
    
    F --> Q[Navigate to Page]
    F --> R[Get Current Page]
    
    G --> S[Check Budget]
    G --> T[Update Budget]
    
    H --> U[Process Checkout]
    U --> V{Payment Success?}
    V -->|Yes| W[Order Confirmation]
    V -->|No| X[Error Handling]
    
    L --> Y[Validate Stock]
    M --> Z[Update Database]
    N --> AA[Validate Quantity]
    
    Y --> AB{Stock Available?}
    AB -->|Yes| AC[Add Item]
    AB -->|No| AD[Error: Insufficient Stock]
    
    AA --> AE{Valid Quantity?}
    AE -->|Yes| AF[Update Item]
    AE -->|No| AG[Error: Invalid Quantity]
    
    AC --> AH[Update Cart Total]
    AF --> AH
    Z --> AH
    
    AH --> AI[Return Success Response]
    AD --> AI
    AG --> AI
    
    AI --> AJ[Update Frontend State]
    AJ --> AK[User Feedback]
```

## 🔧 Agent Tool Flow - Detailed

```mermaid
sequenceDiagram
    participant User
    participant AI_Agent
    participant Context_Manager
    participant Tool_Executor
    participant API_Endpoint
    participant Database
    
    User->>AI_Agent: "Add 2 Dipirona to cart"
    AI_Agent->>Context_Manager: Get session ID
    Context_Manager-->>AI_Agent: session-123
    
    AI_Agent->>Tool_Executor: Execute add_to_cart_simple
    Tool_Executor->>API_Endpoint: POST /api/cart-simple
    API_Endpoint->>Database: Check product stock
    Database-->>API_Endpoint: Stock: 150 available
    
    API_Endpoint->>Database: Add item to cart
    Database-->>API_Endpoint: Success
    
    API_Endpoint-->>Tool_Executor: {success: true, cart: {...}}
    Tool_Executor-->>AI_Agent: Operation completed
    AI_Agent-->>User: "Added 2 Dipirona to your cart!"
```

## 🛒 Cart Management Flow

```mermaid
flowchart TD
    Start([Cart Operation]) --> GetSession[Get Session ID]
    GetSession --> ValidateInput{Validate Input}
    
    ValidateInput -->|Add Item| CheckStock[Check Product Stock]
    CheckStock -->|Stock Available| AddToDB[Add to Database]
    CheckStock -->|Stock Unavailable| ErrorStock[Return Error]
    
    ValidateInput -->|Remove Item| RemoveFromDB[Remove from Database]
    
    ValidateInput -->|Update Quantity| ValidateQuantity{Quantity > 0?}
    ValidateQuantity -->|Yes| UpdateDB[Update Database]
    ValidateQuantity -->|No| RemoveItem[Remove Item]
    
    ValidateInput -->|View Cart| FetchCart[Fetch Cart from DB]
    
    ValidateInput -->|Clear Cart| ClearDB[Clear Cart in DB]
    
    AddToDB --> UpdateTotals[Update Cart Totals]
    RemoveFromDB --> UpdateTotals
    UpdateDB --> UpdateTotals
    ClearDB --> ResetTotals[Reset Totals]
    
    UpdateTotals --> ReturnResponse[Return Response]
    ResetTotals --> ReturnResponse
    FetchCart --> ReturnResponse
    ErrorStock --> ReturnResponse
    
    ReturnResponse --> UpdateFrontend[Update Frontend State]
    UpdateFrontend --> End([Operation Complete])
```

## 🔄 Session Management Flow

```mermaid
flowchart TD
    A[User Session Start] --> B{Session Exists?}
    B -->|Yes| C[Use Existing Session]
    B -->|No| D[Generate New Session]
    
    C --> E[Load Cart Data]
    D --> E
    
    E --> F[Initialize Cart State]
    F --> G[Ready for