-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 29, 2026 at 09:59 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `movie_booking_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `Admin_ID` int(11) NOT NULL,
  `Admin_First_Name` varchar(20) NOT NULL,
  `Admin_email` varchar(30) NOT NULL,
  `Admin_Last_Name` varchar(20) NOT NULL,
  `Admin_Contact_No` varchar(12) NOT NULL,
  `Admin_Password_Hash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`Admin_ID`, `Admin_First_Name`, `Admin_email`, `Admin_Last_Name`, `Admin_Contact_No`, `Admin_Password_Hash`) VALUES
(0, 'Admin', 'admin@cinebook.com', 'User', '1234567890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `Booking_ID` int(11) NOT NULL,
  `Booking_Status` varchar(20) DEFAULT NULL,
  `TimeStamping` datetime DEFAULT current_timestamp(),
  `Customer_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`Booking_ID`, `Booking_Status`, `TimeStamping`, `Customer_ID`) VALUES
(1, 'Confirmed', '2026-01-29 00:55:15', 1);

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `Customer_ID` int(11) NOT NULL,
  `Customer_First_Name` varchar(20) NOT NULL,
  `Customer_Last_Name` varchar(20) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `NIC` varchar(15) NOT NULL,
  `Customer_Contact` varchar(15) NOT NULL,
  `Customer_Password_Hash` varchar(225) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`Customer_ID`, `Customer_First_Name`, `Customer_Last_Name`, `Email`, `NIC`, `Customer_Contact`, `Customer_Password_Hash`) VALUES
(1, 'Kethmika', 'Edirisinghe', 'kethmikaed@gmail.com', '200400812784', '0763670678', '$2y$10$xCWOgpDDcIHupYdwfGAL2uHJFuRR5RQUBp6RC0VqhyBvh73.R5oo2');

-- --------------------------------------------------------

--
-- Table structure for table `hall`
--

CREATE TABLE `hall` (
  `Hall_ID` int(11) NOT NULL,
  `Total_seats` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hall`
--

INSERT INTO `hall` (`Hall_ID`, `Total_seats`) VALUES
(1, 50);

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `Invoice_ID` int(11) NOT NULL,
  `Total_payment` decimal(8,2) DEFAULT NULL,
  `Payment_status` varchar(20) DEFAULT NULL,
  `Booking_ID` int(11) DEFAULT NULL,
  `Admin_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `movie`
--

CREATE TABLE `movie` (
  `Movie_ID` int(11) NOT NULL,
  `Title` varchar(100) NOT NULL,
  `Genre` varchar(50) DEFAULT NULL,
  `Movie_Language` varchar(30) DEFAULT NULL,
  `Release_date` date DEFAULT NULL,
  `Duration_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movie`
--

INSERT INTO `movie` (`Movie_ID`, `Title`, `Genre`, `Movie_Language`, `Release_date`, `Duration_time`) VALUES
(1, 'Greenland 2: Migration', 'Action/Thriller', 'English', '2026-01-09', 115),
(2, 'Mercy', 'Sci-Fi/Crime', 'English', '2026-01-23', 100),
(3, 'Send Help', 'Horror/Thriller', 'English', '2026-01-30', 105),
(4, 'Wuthering Heights', 'Romance/Drama', 'English', '2026-02-12', 130),
(5, 'Scream 7', 'Horror', 'English', '2026-02-26', 110),
(6, 'Toy Story 5', 'Animation/Family', 'English', '2026-06-19', 100),
(7, 'The Odyssey', 'Action/Fantasy', 'English', '2026-07-17', 140),
(8, 'Avengers: Doomsday', 'Superhero/Action', 'English', '2026-12-18', 150);

-- --------------------------------------------------------

--
-- Table structure for table `seat`
--

CREATE TABLE `seat` (
  `Seat_ID` int(11) NOT NULL,
  `Seat_No` varchar(10) NOT NULL,
  `Seat_type` varchar(15) DEFAULT NULL,
  `Hall_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seat`
--

INSERT INTO `seat` (`Seat_ID`, `Seat_No`, `Seat_type`, `Hall_ID`) VALUES
(1, 'A1', 'Premium', 1),
(2, 'A2', 'Premium', 1),
(3, 'A3', 'Premium', 1),
(4, 'A4', 'Premium', 1),
(5, 'A5', 'Premium', 1),
(6, 'A6', 'Premium', 1),
(7, 'A7', 'Premium', 1),
(8, 'A8', 'Premium', 1),
(9, 'A9', 'Premium', 1),
(10, 'A10', 'Premium', 1),
(11, 'B1', 'Standard', 1),
(12, 'B2', 'Standard', 1),
(13, 'B3', 'Standard', 1),
(14, 'B4', 'Standard', 1),
(15, 'B5', 'Standard', 1),
(16, 'B6', 'Standard', 1),
(17, 'B7', 'Standard', 1),
(18, 'B8', 'Standard', 1),
(19, 'B9', 'Standard', 1),
(20, 'B10', 'Standard', 1),
(21, 'C1', 'Standard', 1),
(22, 'C2', 'Standard', 1),
(23, 'C3', 'Standard', 1),
(24, 'C4', 'Standard', 1),
(25, 'C5', 'Standard', 1),
(26, 'C6', 'Standard', 1),
(27, 'C7', 'Standard', 1),
(28, 'C8', 'Standard', 1),
(29, 'C9', 'Standard', 1),
(30, 'C10', 'Standard', 1),
(31, 'D1', 'Standard', 1),
(32, 'D2', 'Standard', 1),
(33, 'D3', 'Standard', 1),
(34, 'D4', 'Standard', 1),
(35, 'D5', 'Standard', 1),
(36, 'D6', 'Standard', 1),
(37, 'D7', 'Standard', 1),
(38, 'D8', 'Standard', 1),
(39, 'D9', 'Standard', 1),
(40, 'D10', 'Standard', 1),
(41, 'E1', 'Standard', 1),
(42, 'E2', 'Standard', 1),
(43, 'E3', 'Standard', 1),
(44, 'E4', 'Standard', 1),
(45, 'E5', 'Standard', 1),
(46, 'E6', 'Standard', 1),
(47, 'E7', 'Standard', 1),
(48, 'E8', 'Standard', 1),
(49, 'E9', 'Standard', 1),
(50, 'E10', 'Standard', 1);

-- --------------------------------------------------------

--
-- Table structure for table `showtime`
--

CREATE TABLE `showtime` (
  `Showtime_ID` int(11) NOT NULL,
  `Show_Date` date NOT NULL,
  `Start_time` time NOT NULL,
  `End_time` time NOT NULL,
  `Hall_ID` int(11) DEFAULT NULL,
  `Movie_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `showtime`
--

INSERT INTO `showtime` (`Showtime_ID`, `Show_Date`, `Start_time`, `End_time`, `Hall_ID`, `Movie_ID`) VALUES
(1, '2026-01-09', '10:00:00', '11:55:00', 1, 1),
(2, '2026-01-09', '16:00:00', '17:55:00', 1, 1),
(3, '2026-01-23', '10:00:00', '11:40:00', 1, 2),
(4, '2026-01-23', '14:00:00', '15:40:00', 1, 2),
(5, '2026-01-30', '10:00:00', '11:45:00', 1, 3),
(6, '2026-01-30', '16:00:00', '17:45:00', 1, 3),
(7, '2026-02-12', '13:00:00', '15:10:00', 1, 4),
(8, '2026-02-12', '18:00:00', '20:10:00', 1, 4),
(9, '2026-02-26', '14:00:00', '15:50:00', 1, 5),
(10, '2026-02-26', '19:00:00', '20:50:00', 1, 5),
(11, '2026-06-19', '10:00:00', '11:40:00', 1, 6),
(12, '2026-06-19', '13:00:00', '14:40:00', 1, 6),
(13, '2026-07-17', '14:00:00', '16:20:00', 1, 7),
(14, '2026-07-17', '18:00:00', '20:20:00', 1, 7),
(15, '2026-12-18', '13:00:00', '15:30:00', 1, 8),
(16, '2026-12-18', '16:00:00', '18:30:00', 1, 8),
(17, '2026-12-18', '19:00:00', '21:30:00', 1, 8);

-- --------------------------------------------------------

--
-- Table structure for table `ticket`
--

CREATE TABLE `ticket` (
  `Ticket_ID` int(11) NOT NULL,
  `Price` decimal(8,2) DEFAULT NULL,
  `Showtime_ID` int(11) DEFAULT NULL,
  `Booking_ID` int(11) DEFAULT NULL,
  `Seat_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket`
--

INSERT INTO `ticket` (`Ticket_ID`, `Price`, `Showtime_ID`, `Booking_ID`, `Seat_ID`) VALUES
(1, 1500.00, 14, 1, 1),
(2, 1000.00, 14, 1, 12);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`Admin_ID`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`Booking_ID`),
  ADD KEY `Customer_ID` (`Customer_ID`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`Customer_ID`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD UNIQUE KEY `NIC` (`NIC`);

--
-- Indexes for table `hall`
--
ALTER TABLE `hall`
  ADD PRIMARY KEY (`Hall_ID`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`Invoice_ID`),
  ADD UNIQUE KEY `Booking_ID` (`Booking_ID`),
  ADD KEY `Admin_ID` (`Admin_ID`);

--
-- Indexes for table `movie`
--
ALTER TABLE `movie`
  ADD PRIMARY KEY (`Movie_ID`);

--
-- Indexes for table `seat`
--
ALTER TABLE `seat`
  ADD PRIMARY KEY (`Seat_ID`),
  ADD KEY `Hall_ID` (`Hall_ID`);

--
-- Indexes for table `showtime`
--
ALTER TABLE `showtime`
  ADD PRIMARY KEY (`Showtime_ID`),
  ADD KEY `Hall_ID` (`Hall_ID`),
  ADD KEY `Movie_ID` (`Movie_ID`);

--
-- Indexes for table `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`Ticket_ID`),
  ADD UNIQUE KEY `unique_seat_booking` (`Seat_ID`,`Booking_ID`),
  ADD KEY `Showtime_ID` (`Showtime_ID`),
  ADD KEY `Booking_ID` (`Booking_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `Admin_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `Booking_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `Customer_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hall`
--
ALTER TABLE `hall`
  MODIFY `Hall_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `Invoice_ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `movie`
--
ALTER TABLE `movie`
  MODIFY `Movie_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `seat`
--
ALTER TABLE `seat`
  MODIFY `Seat_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `showtime`
--
ALTER TABLE `showtime`
  MODIFY `Showtime_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `ticket`
--
ALTER TABLE `ticket`
  MODIFY `Ticket_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`Customer_ID`) REFERENCES `customer` (`Customer_ID`);

--
-- Constraints for table `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`Booking_ID`) REFERENCES `booking` (`Booking_ID`),
  ADD CONSTRAINT `invoice_ibfk_2` FOREIGN KEY (`Admin_ID`) REFERENCES `admin` (`Admin_ID`);

--
-- Constraints for table `seat`
--
ALTER TABLE `seat`
  ADD CONSTRAINT `seat_ibfk_1` FOREIGN KEY (`Hall_ID`) REFERENCES `hall` (`Hall_ID`);

--
-- Constraints for table `showtime`
--
ALTER TABLE `showtime`
  ADD CONSTRAINT `showtime_ibfk_1` FOREIGN KEY (`Hall_ID`) REFERENCES `hall` (`Hall_ID`),
  ADD CONSTRAINT `showtime_ibfk_2` FOREIGN KEY (`Movie_ID`) REFERENCES `movie` (`Movie_ID`);

--
-- Constraints for table `ticket`
--
ALTER TABLE `ticket`
  ADD CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`Showtime_ID`) REFERENCES `showtime` (`Showtime_ID`),
  ADD CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`Booking_ID`) REFERENCES `booking` (`Booking_ID`),
  ADD CONSTRAINT `ticket_ibfk_3` FOREIGN KEY (`Seat_ID`) REFERENCES `seat` (`Seat_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
