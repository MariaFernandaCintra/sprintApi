CREATE DATABASE  IF NOT EXISTS `rs` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `rs`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: rs
-- ------------------------------------------------------
-- Server version	8.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `NIF` char(7) NOT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `NIF` (`NIF`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'João Silva','joao.silva@example.com','3456789','senha123'),(2,'Maria Oliveira','maria.oliveira@example.com','7654321','senha123'),(3,'Carlos Pereira','carlos.pereira@example.com','3987456','senha123'),(4,'Ana Souza','ana.souza@example.com','6123789','senha123'),(5,'Pedro Costa','pedro.costa@example.com','9123456','senha123'),(6,'Laura Lima','laura.lima@example.com','1654987','senha123'),(7,'Lucas Alves','lucas.alves@example.com','4321987','senha123'),(8,'Fernanda Rocha','fernanda.rocha@example.com','1852963','senha123'),(9,'Rafael Martins','rafael.martins@example.com','9258147','senha123'),(10,'Juliana Nunes','juliana.nunes@example.com','8147369','senha123'),(11,'Paulo Araujo','paulo.araujo@example.com','9753486','senha123'),(12,'Beatriz Melo','beatriz.melo@example.com','6159753','senha123'),(13,'Renato Dias','renato.dias@example.com','3486159','senha123'),(14,'Camila Ribeiro','camila.ribeiro@example.com','3852741','senha123'),(15,'Thiago Teixeira','thiago.teixeira@example.com','2741963','senha123'),(16,'Patrícia Fernandes','patricia.fernandes@example.com','1963852','senha123'),(17,'Rodrigo Gomes','rodrigo.gomes@example.com','3741852','senha123'),(18,'Mariana Batista','mariana.batista@example.com','7258369','senha123'),(19,'Fábio Freitas','fabio.freitas@example.com','9147258','senha123'),(20,'Isabela Cardoso','isabela.cardoso@example.com','8369147','senha123');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-26 20:21:39
