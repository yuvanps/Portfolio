# Yuvan Pramesh Selvarangam

Electronics & Communication Engineering student building embedded systems, custom PCBs and C/C++ software

B.Tech ECE student at VIT (2023-2027, CGPA 8.74) working across embedded firmware, PCB design, robotics and systems software. Primary language is C/C++. Interests: embedded systems, cybersecurity, telecommunications/6G, and shipping complete hardware-software products.

- Location: Chennai, India
- Email: yuvanp2005@gmail.com
- GitHub: https://github.com/awildweirdo (also https://github.com/yuvanps)
- LinkedIn: https://www.linkedin.com/in/yuvan-pramesh
- Phone: kept private, not for the website
- Interests: Embedded systems, C/C++ systems programming, Cybersecurity, Telecommunications / 6G, Robotics, PCB design, TinyML

## Education

**Vellore Institute of Technology, Chennai**: B.Tech, Electronics and Communication Engineering, 2023-07 to 2027-05, CGPA 8.74/10

Coursework: Computer Communications & Networks, Advanced Cloud Computing, Structured & Object-Oriented Programming, Artificial Intelligence & Machine Learning, Microprocessors & Microcontrollers

## Experience

**Towardz Solutions**, Intern (2026-05 to 2026-07)
- Developed electronic and pneumatic control systems for a bioprinter prototype, improving printing accuracy by 50%.
- Customized the open-source Klipper firmware to support 5+ bioprinting-specific functions, integrating 4 hardware components and reducing manual control requirements by 25%.
- Performed system integration, testing, calibration and troubleshooting across 50+ test cycles, achieving 80% system reliability.

## Projects

### Ticket Booking System (featured)
Personal project

Tech: C++17, Crow, SQLite, OpenSSL, Docker, REST API

Full-stack ticket booking platform written in C++17 with a REST API and SQLite database.

- Real-time seat holds, booking confirmation and waitlist cascading.
- Hand-rolled JWT (HS256) authentication via OpenSSL, salted SHA-256 password hashing, and hashed tamper-proof waitlist tokens.
- Role-based access control for Admin, Organiser and Customer roles.
- 10-table relational schema; atomic transactions (SQLite WAL mode) to prevent double-booking race conditions.
- Containerised with Docker and deployed to Render; 4 automated test suites.

Link (repo): https://github.com/yuvanps/TicketBookingSystem

Repo visibility: check before publishing

### Fully Automated Meal Maker (Nexcook) (featured)
Client consultancy project for Mitatronics, Mumbai | 2025-03 to present

Tech: ESP32-S3, FreeRTOS, LVGL 8.3.11, SquareLine Studio, Altium Designer, I2C

Commercial cooking automation system developed as part of a consultancy engagement.

- Multi-core ESP32 control system on FreeRTOS enabling real-time parallel execution of independent kitchen modules.
- Custom PCBs designed and validated in Altium Designer: schematic capture, layout, DRC, component selection and prototype bring-up.
- LVGL touchscreen HMI with I2C-connected sensors and actuators for recipe execution, monitoring and safety control.
- Integrated firmware, custom electronics and electromechanical subsystems with mechanical and electrical teams.

Repo visibility: private repos (Nexcook_ESP32, Nexcook_externESPcoded, Nexcook_UI_ESP32_LVGL_SLS, Nexcook_GravyMaker) - do not link

### 4-Channel TB6600HG Stepper Driver PCB
Hardware design (part of the cooking automation system)

Tech: Altium Designer, TB6600HG

100x80mm driver board for the cooking machine with channels for Onion, Tomato, Chopper and Grinder Base.

- Layer strategy, DRC rules with HighCurrent and Digital net classes, and copper pour planning.
- Star-point LGND/PGND grounding to isolate noise-sensitive digital signals from motor current.

### Custom ESP32-S3 Carrier Board (featured)
Personal hardware project

Tech: Altium Designer, ESP32-S3, FTDI, USB-C

4-layer high-speed PCB integrating ESP32, FTDI and dual USB-C interfaces.

- Differential-pair routing and power distribution tuned for signal integrity and EMI performance.
- Multilayer ground and power plane management with stitching vias and impedance-controlled traces.

Link (repo): https://github.com/awildweirdo/Custom_ESP32-S3_CarrierBoard_PCB

Repo visibility: public

### Autonomous Factory Patrol Drone (featured)
Personal project | 2026-07 to present

Tech: PX4, Gazebo, ROS 2, STM32

Compact autonomous drone concept for indoor factory surveillance and patrol.

- Mission planning and patrol trajectories simulated with PX4 SITL, Gazebo and ROS 2 on a custom factory world for the x500 quadrotor.
- STM32 companion controller architecture for high-level mission control and flight-controller communication.
- Waypoint navigation and emergency handling workflow.
- Debugged missing IMU plugin and magnetometer mismatch (spherical coordinates block); investigating height-estimate stability under real-time-factor degradation.

### TinyML Keyword Spotting
Personal project

Tech: ESP32-S3, TensorFlow Lite Micro, CNN, INT8 quantization

CNN trained and INT8-quantized for on-device keyword spotting on an ESP32-S3.

OPEN QUESTION: Repo not visible in the GitHub listing provided. Ask Yuvan for details/link before writing more than the one-line description.

### Cellular Network Simulation & Analysis
Academic / personal

Tech: ns-3, MATLAB

LTE scheduler comparison and cellular frequency-reuse analysis.

- ns-3 LTE simulations comparing Round Robin, Proportional Fair and Max Throughput schedulers using Jain's Fairness Index.
- MATLAB SIR table generation for cellular frequency-reuse analysis.

### Pneumatic Bio 3D Printer
Hardware build

Tech: Klipper, Raspberry Pi 3B+, BTT SKR v1.4, Solenoid valve

Pneumatic bio-printer dispensing calcium-based bio-ink through a solenoid valve on the FAN0 header.

- Full Klipper config with a dummy extruder (resistor workaround) and TRAVEL / PRINT_LINE macros for solenoid logic.
- Planned calibration pipeline ahead of first tissue prints.

OPEN QUESTION: Closely related to the Towardz internship work. Confirm with Yuvan whether to present as a separate project or merge into the internship entry.

### ChocoGenie
Personal project

Tech: C, C++, LVGL, Raspberry Pi

Gamified vending machine UI built with LVGL on a Raspberry Pi.

- Debugged PNG asset loading by registering the missing PNG decoder (lv_png_init and lv_conf.h configuration).

Repo visibility: private - do not link

### Spectral Subtraction (MATLAB)
Signal processing

Tech: MATLAB

MATLAB implementation of the spectral subtraction noise-reduction method.

Link (repo): https://github.com/awildweirdo/Spectral_subtraction_matlab

Repo visibility: public

### Generator Issue Detector (ESP32 + Harmonic Analysis)
Personal project

Tech: ESP32, Python, Harmonic analysis

Detects generator issues using harmonic analysis on ESP32 data.

Link (repo): https://github.com/awildweirdo/Generator-issue-detector_ESp32_harmonic-analysis

Repo visibility: public

### Arduino FM Radio
Personal project

Tech: Arduino, C++

FM radio built on Arduino.

Link (repo): https://github.com/awildweirdo/Arduino_FM_Radio

Repo visibility: public

### my_bot
Personal project

Tech: Python

Python bot project (Apache 2.0 licensed).

Link (repo): https://github.com/awildweirdo/my_bot

Repo visibility: public

## Skills

- **Languages**: C/C++ (primary), Python, Java, JavaScript, Embedded C, MATLAB, Assembly, SQL
- **Embedded & Real-time**: ESP32 / ESP32-S3, STM32, FreeRTOS, LVGL, Klipper firmware, Raspberry Pi
- **Hardware design & test**: Altium Designer, LTspice, Oscilloscope, Logic analyzer, Soldering & rework
- **Protocols**: I2C, SPI, UART, CAN, Wi-Fi
- **Robotics & simulation**: PX4, Gazebo, ROS 2, ns-3
- **Software & tooling**: Git/GitHub, Docker, CMake, Linux, SQLite, REST APIs, JWT auth, OpenSSL
- **Security & networking**: Kali Linux, TCP/IP, Wireshark, NMAP, Aircrack-ng, Cisco Packet Tracer
- **ML**: TensorFlow Lite Micro, CNN training, INT8 quantization

## Leadership

**HumanoidX, VIT**, Electronics Team Lead (2025-04 to 2026-04)
- Led a 20+ member team designing electronics for an all-terrain rocker-bogie rover and a search-and-rescue hexapod.
- Managed team organisation, resource allocation and collaborative decision-making to deliver milestones on time.

OPEN QUESTION: Original resume gives 04/2025 - 04/2026. Some tailored resumes said 'Present'. Confirm the correct end date.

**InnovDrive, VIT**, Electronics Team Lead (2024-04 to 2024-12)
- Led a team of 5 developing electrical systems for motorbikes: embedded control, sensor integration and power management.

**Linux Club, VIT**, Member (2023-10 to 2024-10)
- Hands-on Linux and Kali Linux, networking and security concepts through labs, CTFs and workshops.

## Achievements

- **Winner, International NetSim Hackathon** (Hosted at VIT). Add the year and organiser if Yuvan supplies them.
- **Student Coordination Team, Nokia Skillathon** (VIT)
- **Attended 10 Years of Nokia Bangalore University Collaboration (NBUC)** (Nokia Bangalore, 2024-10-21). Saw demos on network slicing and object sensing using 6G communication signals; sparked interest in telecommunications.
