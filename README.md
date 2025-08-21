# Comprog Platform - Modular Learning Architecture

A scalable competitive programming learning platform with a modular architecture that allows independent creation of concepts, implementations, and problems.

## 🏗️ Architecture Overview

The platform uses a **modular architecture** with three independent content types:

- **Concepts** (Yellow) - Theoretical knowledge and understanding
- **Implementations** (Blue) - Code examples and practical implementations  
- **Problems** (Red) - Practice problems and exercises

Each module can be created independently and linked together using beautiful block-style links in MDX content.

## 🚀 Features

### For Admins
- **Independent Content Creation**: Create concepts, implementations, and problems separately
- **Rich MDX Content**: Full markdown support with custom link syntax
- **Content Linking**: Link related content using `[[type:slug|title]]` syntax
- **Publishing System**: Draft → Published workflow
- **Tagging & Difficulty**: Organize content with tags and difficulty levels

### For Users
- **Modular Learning**: Learn concepts, implementations, and problems independently
- **Dependency Management**: Clear links between related content
- **Beautiful UI**: Clean, modern interface with color-coded content types

## 📝 Content Linking Syntax

In your MDX content, you can create beautiful links to other content:

```markdown
# Example Content

This content covers sorting algorithms. First, let's understand the concept:

[[concept:sorting-basics|Sorting Algorithms Fundamentals]]

Then we'll implement it:

[[implementation:quicksort-implementation|QuickSort Implementation]]

Finally, practice with this problem:

[[problem:sorting-practice|Sorting Practice Problem]]
```

This creates beautiful, clickable blocks that link to the respective content.

## 🎨 Color Coding

- **🟡 Concepts** - Yellow theme for theoretical content
- **🔵 Implementations** - Blue theme for code examples  
- **🔴 Problems** - Red theme for practice exercises

## 🛠️ Development Setup

### Prerequisites
- Docker and Docker Compose
- PostgreSQL (local or containerized)

### Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd comprog-platform
   ```

2. **Start the services**:
   ```bash
   docker compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Create your first admin account**:
   - Register at http://localhost:5173
   - The first user becomes an admin automatically

## 📚 Usage Guide

### Creating Content

1. **Login as Admin** → Go to Admin Panel
2. **Choose Content Type**:
   - **Concepts Tab**: Create theoretical content
   - **Implementations Tab**: Create code examples
   - **Problems Tab**: Create practice problems

3. **Create New Content**:
   - Click "New [Content Type]"
   - Enter a slug (e.g., `sorting-basics`)
   - Fill in title, description, and MDX content
   - Set difficulty and tags
   - Publish when ready

### Linking Content

In your MDX content, use the linking syntax:

```markdown
# My Content

Here's a concept you need to understand:
[[concept:arrays-basics|Arrays Fundamentals]]

And here's how to implement it:
[[implementation:array-operations|Array Operations in Python]]

Practice with this problem:
[[problem:array-practice|Array Practice Problems]]
```

## 🔧 API Endpoints

### Concepts
- `GET /api/concepts/` - List concepts
- `POST /api/concepts/` - Create concept
- `GET /api/concepts/{id}/` - Get concept details
- `PUT /api/concepts/{id}/` - Update concept
- `DELETE /api/concepts/{id}/` - Delete concept
- `POST /api/concepts/{id}/publish/` - Publish concept

### Implementations
- `GET /api/implementations/` - List implementations
- `POST /api/implementations/` - Create implementation
- `GET /api/implementations/{id}/` - Get implementation details
- `PUT /api/implementations/{id}/` - Update implementation
- `DELETE /api/implementations/{id}/` - Delete implementation
- `POST /api/implementations/{id}/publish/` - Publish implementation

### Problems
- `GET /api/problems/` - List problems
- `POST /api/problems/` - Create problem
- `GET /api/problems/{id}/` - Get problem details
- `PUT /api/problems/{id}/` - Update problem
- `DELETE /api/problems/{id}/` - Delete problem
- `POST /api/problems/{id}/publish/` - Publish problem

## 🎯 Example Workflow

1. **Create a Concept**: "Sorting Algorithms" (Yellow)
   - Explain what sorting is, why it's important
   - Use `[[implementation:quicksort|QuickSort]]` to link to implementation

2. **Create an Implementation**: "QuickSort Implementation" (Blue)
   - Show the code, explain the algorithm
   - Use `[[concept:sorting-basics|Sorting Basics]]` to link back to concept

3. **Create a Problem**: "Sorting Practice" (Red)
   - Provide practice problems
   - Use `[[concept:sorting-basics|Sorting Basics]]` to link to concept

## 🔮 Future Enhancements

- **Interactive Code Editor**: Run code examples in the browser
- **Progress Tracking**: Track user progress through content
- **Search & Filter**: Advanced search across all content types
- **Collaborative Editing**: Multiple admins can edit content
- **Version Control**: Track changes to content over time
- **Analytics**: See which content is most popular/effective

## 🤝 Contributing

This is a learning platform designed to be easily extensible. The modular architecture makes it simple to add new content types or features.

## 📄 License

This project is designed for educational purposes.
